import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Users:', await prisma.user.findMany());
  console.log('Sections:', await prisma.section.findMany());
}
main().catch(console.error).finally(() => prisma.$disconnect());
