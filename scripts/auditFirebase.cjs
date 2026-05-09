const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function audit() {
  console.log('--- Firebase Audit Started ---');
  
  try {
    // 1. Audit Salons
    console.log('\nScanning Salons...');
    const salonsSnap = await getDocs(collection(db, 'salons'));
    console.log(`Found ${salonsSnap.size} salons.`);
    salonsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`- [${doc.id}] ${data.name} (Approved: ${data.adminApproved})`);
    });

    // 2. Audit Users (Might fail if not logged in/rules strict)
    console.log('\nScanning Users...');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      console.log(`Found ${usersSnap.size} users.`);
      usersSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- [${doc.id}] ${data.name} (${data.role})`);
      });
    } catch (e) {
      console.log('Skipping users (Access Denied - expected if rules are strict)');
    }

    // 3. Audit Bookings
    console.log('\nScanning Bookings...');
    try {
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      console.log(`Found ${bookingsSnap.size} bookings.`);
    } catch (e) {
      console.log('Skipping bookings (Access Denied)');
    }

  } catch (error) {
    console.error('Audit failed:', error.message);
  }
  
  console.log('\n--- Audit Complete ---');
}

audit();
