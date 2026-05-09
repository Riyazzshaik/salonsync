const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: serviceAccountKey.json not found!');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  console.log('=== STARTING PRODUCTION SEEDING ===');
  
  try {
    // 1. Create Admin Account
    console.log('Creating Admin Account...');
    const adminEmail = 'admin@salonsync.com';
    const adminPassword = 'AdminPassword123!'; // Change this immediately
    
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(adminEmail);
      console.log('- Admin account already exists in Auth.');
    } catch (e) {
      adminUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'System Admin'
      });
      console.log('- Created Admin account in Auth.');
    }

    await db.collection('users').doc(adminUser.uid).set({
      uid: adminUser.uid,
      name: 'System Admin',
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    console.log('- Admin profile created/updated in Firestore.');

    // 2. Create Demo Salon
    console.log('Creating Demo Salon...');
    const demoSalon = {
      name: 'SalonSync Demo Premier',
      address: '100 Innovation Way, Tech Park',
      latitude: 12.9716,
      longitude: 77.5946,
      services: [
        { id: 's1', name: 'Classic Haircut', price: 25, duration: 30 },
        { id: 's2', name: 'Beard Styling', price: 15, duration: 20 },
        { id: 's3', name: 'Head Massage', price: 10, duration: 15 }
      ],
      queueLength: 0,
      averageServiceTime: 20,
      estimatedWaitTime: 0,
      rating: 5.0,
      images: ['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1000'],
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1000',
      openStatus: true,
      adminApproved: true,
      ownerId: adminUser.uid, // Admin acts as owner for demo
      createdAt: new Date().toISOString()
    };

    const salonRef = await db.collection('salons').add(demoSalon);
    console.log(`- Demo Salon created with ID: ${salonRef.id}`);

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seed();
