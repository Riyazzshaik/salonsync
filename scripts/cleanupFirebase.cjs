const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * FIREBASE PRODUCTION CLEANUP SCRIPT
 * This script resets the environment for production launch.
 * IMPORTANT: Requires serviceAccountKey.json in the root directory.
 */

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: serviceAccountKey.json not found!');
  console.log('Please download it from Firebase Console > Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage().bucket();

async function deleteCollection(collectionPath, batchSize = 100, filterFn = null) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject, filterFn);
  });
}

async function deleteQueryBatch(query, resolve, reject, filterFn) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    if (!filterFn || filterFn(doc.data(), doc.id)) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve, reject, filterFn);
  });
}

async function cleanupAuth() {
  console.log('Cleaning up Authentication...');
  const users = await auth.listUsers();
  const deletePromises = users.users.map(user => {
    // PROTECT: Keep admin@salonsync.com or other known production accounts
    if (user.email === 'admin@salonsync.com') {
      console.log(`- Keeping admin account: ${user.email}`);
      return Promise.resolve();
    }
    console.log(`- Deleting user: ${user.email}`);
    return auth.deleteUser(user.uid);
  });
  await Promise.all(deletePromises);
}

async function cleanupFirestore() {
  console.log('Cleaning up Firestore...');
  
  console.log('- Clearing bookings...');
  await deleteCollection('bookings');
  
  console.log('- Clearing queues...');
  await deleteCollection('queues');
  
  console.log('- Clearing adminLogs...');
  await deleteCollection('adminLogs');
  
  console.log('- Cleaning salons (keeping approved ones)...');
  await deleteCollection('salons', 100, (data) => !data.adminApproved);
  
  console.log('- Cleaning notifications...');
  await deleteCollection('notifications');
}

async function cleanupStorage() {
  console.log('Cleaning up Storage...');
  // This will delete everything in the bucket except for a 'production' folder if it existed
  // Caution: Be careful with bulk storage deletion
  // For now, we just list and delete files in 'temp/' or 'test/' if they exist
  const [files] = await storage.getFiles({ prefix: 'temp/' });
  const deletePromises = files.map(file => {
    console.log(`- Deleting file: ${file.name}`);
    return file.delete();
  });
  await Promise.all(deletePromises);
}

async function run() {
  console.log('=== STARTING FIREBASE PRODUCTION RESET ===');
  try {
    await cleanupAuth();
    await cleanupFirestore();
    // await cleanupStorage(); // Uncomment when ready
    console.log('\n=== RESET COMPLETE ===');
    console.log('The environment is now clean and ready for production seeding.');
  } catch (error) {
    console.error('Reset failed:', error);
  }
}

run();
