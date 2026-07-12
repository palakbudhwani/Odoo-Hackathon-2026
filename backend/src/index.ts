import 'dotenv/config';
import app from './app';
import prisma from './prisma';

const port = Number(process.env.PORT || 4000);
const defaultRoles = ['User', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'];

async function seedRoles() {
  for (const name of defaultRoles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function main() {
  await seedRoles();
  app.listen(port, () => {
    console.log(`TransitOps API listening on http://localhost:${port}`);
  });
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
