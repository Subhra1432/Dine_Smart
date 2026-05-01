
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.menuItem.update({
    where: { restaurantId_name: { restaurantId: (await prisma.restaurant.findUnique({ where: { slug: 'spice-garden' } }))?.id || '', name: 'Paneer Tikka' } },
    data: { isAvailable: false }
  });
  console.log('Updated:', result.name, 'isAvailable:', result.isAvailable);
}

main().catch(console.error).finally(() => prisma.$disconnect());
