import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    select: {
      name: true,
      slug: true,
      status: true,
      isActive: true,
    },
    take: 5,
  });
  console.log(JSON.stringify(restaurants, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
