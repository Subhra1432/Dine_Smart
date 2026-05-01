
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: 'spice-garden' } });
  if (!restaurant) {
    console.error('Restaurant not found');
    return;
  }

  const category = await prisma.category.findFirst({ 
    where: { restaurantId: restaurant.id, name: 'Main Course' } 
  });
  
  if (!category) {
    console.error('Category not found');
    return;
  }

  const items = [
    {
      name: 'Lobster Thermidor',
      description: 'Classic French dish consisting of a creamy mixture of cooked lobster meat, egg yolks, and brandy.',
      price: 1299,
      isVeg: false,
      preparationTimeMinutes: 30,
      tags: ['premium', 'seafood'],
      imageUrl: 'https://images.unsplash.com/photo-1553247407-23251ce81f59?auto=format&fit=crop&q=80'
    },
    {
      name: 'Truffle Mushroom Risotto',
      description: 'Creamy Arborio rice with wild mushrooms and infused with black truffle oil.',
      price: 749,
      isVeg: true,
      preparationTimeMinutes: 25,
      tags: ['premium', 'vegetarian'],
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80'
    }
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: item.name } },
      update: item,
      create: { ...item, restaurantId: restaurant.id, categoryId: category.id }
    });
    console.log('Added/Updated:', item.name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
