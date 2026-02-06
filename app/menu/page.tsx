import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { MenuSection } from "@/components/menu/MenuSection";
import { categories, menuItems } from "@/lib/data";

export default function MenuPage() {
  return (
    <div className="bg-white">
      <Container className="flex flex-col gap-10 py-16">
        <SectionHeading
          eyebrow="Menu"
          title="Every dish, ready for delivery"
          subtitle="Choose a category, add to cart, and checkout with a few simple steps."
        />
        <MenuSection categories={categories} items={menuItems} />
      </Container>
    </div>
  );
}
