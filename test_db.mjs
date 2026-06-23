import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ take: 3 });
  console.log('✅ PostgreSQL connection works! Users found:', users.length);
  users.forEach(u => console.log(' -', u.shop, '|', u.subscriptionPlan));
  await prisma.$disconnect();
}
main().catch(e => { console.error('❌ DB connection failed:', e.message); process.exit(1); });
