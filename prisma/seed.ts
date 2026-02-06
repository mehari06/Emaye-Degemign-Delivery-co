import { prisma } from "../lib/prisma/client";
import { categories, menuItems } from "../lib/data";

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        id: category.id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
      },
    });
  }

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable ?? true,
        categoryId: item.category,
      },
      create: {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable ?? true,
        categoryId: item.category,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
