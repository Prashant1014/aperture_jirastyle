import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.$executeRawUnsafe(`UPDATE "EventAssignment" SET "status" = 'ASSIGNED' WHERE "status" = 'IN_PROGRESS' OR "status" = 'DONE'`);
  console.log("Updated assignments");
}
main().catch(console.error).finally(() => prisma.$disconnect());
