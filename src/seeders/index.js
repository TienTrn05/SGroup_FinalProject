import AppDataSource from "../config/data-source.js";
import { seedDemo } from "./demo.seeder.js";

async function main() {
  try {
    await AppDataSource.initialize();

    const result = await seedDemo(AppDataSource);

    console.log("Seed completed:", result);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main();
