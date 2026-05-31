import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXYT0q7MElxaguX3g7vn47Sb2ryENkOv0",
  authDomain: "tpa360-9407e.firebaseapp.com",
  projectId: "tpa360-9407e",
  storageBucket: "tpa360-9407e.firebasestorage.app",
  messagingSenderId: "715387194045",
  appId: "1:715387194045:web:a06f1629137722591a85d4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getYearWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${year}-${String(weekNum).padStart(2, '0')}`;
}

async function migrate() {
  console.log('Starting migration...');

  // Get all riders
  const ridersSnap = await getDocs(collection(db, 'riders'));
  console.log(`Found ${ridersSnap.size} riders`);

  for (const riderDoc of ridersSnap.docs) {
    const riderName = riderDoc.id;
    console.log(`\nMigrating rider: ${riderName}`);

    // Get all rides for this rider
    const ridesSnap = await getDocs(collection(db, 'riders', riderName, 'rides'));
    console.log(`  Found ${ridesSnap.size} rides`);

    if (ridesSnap.size === 0) continue;

    // Group rides by yearWeek
    const weekData = {};
    let totalKm = 0;

    for (const rideDoc of ridesSnap.docs) {
      const ride = rideDoc.data();
      if (!ride.date || !ride.distance) continue;

      const yearWeek = getYearWeek(ride.date);
      if (!weekData[yearWeek]) {
        weekData[yearWeek] = 0;
      }
      weekData[yearWeek] += ride.distance;
      totalKm += ride.distance;
    }

    console.log(`  Total km: ${totalKm.toFixed(1)}`);
    console.log(`  Weeks:`, Object.keys(weekData));

    // Write weekly data
    for (const [yearWeek, km] of Object.entries(weekData)) {
      const weekRef = doc(db, 'riders', riderName, 'weeklyData', yearWeek);
      const existing = await getDoc(weekRef);
      const existingKm = existing.data()?.km || 0;
      await setDoc(weekRef, {
        km: existingKm + km,
        weekStart: yearWeek,
        updatedAt: new Date(),
      });
      console.log(`  Week ${yearWeek}: ${km.toFixed(1)} km (total in doc: ${(existingKm + km).toFixed(1)})`);
    }

    // Update rider's totalKm
    console.log(`  Updated totalKm to ${totalKm.toFixed(1)}`);
  }

  console.log('\nMigration complete!');
}

migrate().catch(console.error);
