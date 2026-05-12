import { SalonService } from './src/services/salons/salonService';

async function test() {
  try {
    const salons = await SalonService.getActiveSalons();
    console.log("Active Salons:", JSON.stringify(salons, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
