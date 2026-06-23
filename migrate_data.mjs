/**
 * Migrate data from local SQLite to PostgreSQL (NeonDB)
 * This copies all Users, Sections, and Features from dev.sqlite to NeonDB
 */
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// PostgreSQL client (reads DATABASE_URL from .env)
const pg = new PrismaClient();

// SQLite connection
let sqlite;
try {
  sqlite = new Database(path.join(__dirname, 'prisma', 'dev.sqlite'));
} catch (e) {
  console.error('Could not open SQLite:', e.message);
  process.exit(1);
}

async function migrate() {
  console.log('Starting data migration from SQLite to PostgreSQL...\n');

  // Migrate Users
  const users = sqlite.prepare('SELECT * FROM User').all();
  console.log(`Found ${users.length} users in SQLite`);
  
  for (const user of users) {
    await pg.user.upsert({
      where: { shop: user.shop },
      update: { subscriptionPlan: user.subscriptionPlan },
      create: {
        id: user.id,
        shop: user.shop,
        subscriptionPlan: user.subscriptionPlan || 'FREE',
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
    console.log(`  ✅ Migrated user: ${user.shop}`);
  }

  // Migrate Sections
  const sections = sqlite.prepare('SELECT * FROM Section').all();
  console.log(`\nFound ${sections.length} sections in SQLite`);
  
  for (const section of sections) {
    await pg.section.upsert({
      where: { id: section.id },
      update: {},
      create: {
        id: section.id,
        userId: section.userId,
        title: section.title,
        subtitle: section.subtitle,
        templateId: section.templateId,
        status: section.status || 'DRAFT',
        settings: section.settings,
        createdAt: new Date(section.createdAt),
        updatedAt: new Date(section.updatedAt),
      },
    });
    console.log(`  ✅ Migrated section: ${section.title} (${section.status})`);
  }

  // Migrate Features
  const features = sqlite.prepare('SELECT * FROM Feature').all();
  console.log(`\nFound ${features.length} features in SQLite`);
  
  for (const feature of features) {
    await pg.feature.upsert({
      where: { id: feature.id },
      update: {},
      create: {
        id: feature.id,
        sectionId: feature.sectionId,
        icon: feature.icon,
        title: feature.title,
        description: feature.description,
        buttonText: feature.buttonText,
        buttonLink: feature.buttonLink,
        order: feature.order || 0,
      },
    });
  }
  console.log(`  ✅ Migrated ${features.length} features`);

  // Summary
  const pgUsers = await pg.user.count();
  const pgSections = await pg.section.count();
  const pgFeatures = await pg.feature.count();
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   PostgreSQL now has: ${pgUsers} users, ${pgSections} sections, ${pgFeatures} features`);
  
  await pg.$disconnect();
  sqlite.close();
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
