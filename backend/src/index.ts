import 'dotenv/config';
import app from './app';
import prisma from './prisma';

const port = Number(process.env.PORT || 4000);

async function main() {
  app.listen(port, () => {
    console.log(`TransitOps API listening on http://localhost:${port}`);
  });
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
