import { SalonDataService } from './services/db/db_salon';

async function testModule() {
    console.log("Testing SalonDataService.getSalons()...");
    try {
        const salons = await SalonDataService.getSalons();
        console.log(`Success! Fetched ${salons?.length} salons via the module.`);

        console.log("Testing getSalonById...");
        const salon = await SalonDataService.getSalonById("6baba140-5ba8-4787-b162-dd2240590cb4");
        if (salon) {
            console.log(`Success! Fetched salon: ${salon.name}`);
        } else {
            console.log("Salon not found by ID.");
        }
    } catch (err: any) {
        console.error("Module Test Error:", err);
    }
}

testModule();
