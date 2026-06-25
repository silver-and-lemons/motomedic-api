import { db, bikes } from '../src/shared/infrastructure/database/index.ts';
import { ilike } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const RAW = JSON.parse(
  fs.readFileSync(path.resolve('data/bikes_raw.json'), 'utf-8')
);

async function seed() {
  console.log(`Seeding ${RAW.length} bikes...`);
  let inserted = 0;
  let skipped = 0;

  for (const bike of RAW) {
    const existing = await db
      .select()
      .from(bikes)
      .where(ilike(bikes.model, bike.model))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(bikes).values({
      brand: bike.brand,
      model: bike.model,
      type: bike.type,
      year: bike.year,
      engineSize: bike.engineSize ?? null,
      fuelSys: bike.fuelSys,
      coolSys: bike.coolSys,
    });

    inserted++;
    console.log(`  ✓ ${bike.brand} ${bike.model}`);
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped (duplicates)`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
