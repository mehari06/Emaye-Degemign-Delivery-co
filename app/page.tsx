import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { FoodCard } from "@/components/menu/FoodCard";
import { categories, featuredItems } from "@/lib/data";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default function Home() {
  return (
    <>
      <section className="bg-surface">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border bg-white shadow-soft">
                <BrandLogo />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Emaye Degemign Delivery Co
              </span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl">
              Hot, fresh meals delivered with care.
            </h1>
            <p className="text-base text-slate-600">
              Order pizzas, burgers, burritos, chicken, and drinks crafted to
              arrive hot and ready. Track every step from kitchen to doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/menu" className={buttonStyles({ size: "lg" })}>
                Start your order
              </Link>
              <Link
                href="/orders"
                className={buttonStyles({
                  size: "lg",
                  variant: "secondary",
                })}
              >
                Track delivery
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <div>
                <p className="text-2xl font-semibold text-slate-900">30 min</p>
                Average delivery
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">4.9 / 5</p>
                Customer rating
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">120+</p>
                Menu options
              </div>
            </div>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-[32px] shadow-float sm:h-[420px]">
            <Image
              src="/illustrations/hero_delivery.png"
              alt="Fresh food delivered fast"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="flex flex-col gap-10 py-16">
          <SectionHeading
            eyebrow="Categories"
            title="Explore every craving"
            subtitle="Browse curated categories filled with chef-made recipes. Every dish is crafted for fast delivery without losing flavor."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={category.imageUrl ?? "/images/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {category.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="flex flex-col gap-10 py-16">
          <SectionHeading
            eyebrow="Featured"
            title="Popular picks this week"
            subtitle="Customer favorites with bold flavor, crafted in small batches and delivered hot."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="grid gap-10 py-16 lg:grid-cols-3">
          <div className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition-all hover:shadow-float">
            <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-slate-50">
              <Image
                src="/illustrations/restaurant_prepping.png"
                alt="Curated menus"
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Curated menus
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Seasoned dishes with fresh ingredients and bold flavor profiles.
            </p>
          </div>
          <div className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition-all hover:shadow-float">
            <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-slate-50">
              <Image
                src="/illustrations/tracking_delivery.png"
                alt="Live order tracking"
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Live order tracking
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Follow each step from kitchen prep to delivery arrival.
            </p>
          </div>
          <div className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition-all hover:shadow-float">
            <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-brand-light/10">
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="relative h-full w-full">
                  <Image
                    src="/illustrations/hero_delivery.png"
                    alt="Smart routing"
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Smart delivery routing
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Accurate pin drops and real-time updates for faster drop-offs.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-4">
            <SectionHeading
              eyebrow="App experience"
              title="Designed for speed, clarity, and comfort"
              subtitle="From checkout to delivery, every screen keeps your order in motion with clear feedback and simple actions."
            />
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href="/menu" className={buttonStyles({ size: "lg" })}>
                Order now
              </Link>
              <Link
                href="/profile"
                className={buttonStyles({
                  size: "lg",
                  variant: "secondary",
                })}
              >
                Create account
              </Link>
            </div>
          </div>
          <div className="relative h-72 overflow-hidden rounded-[32px] shadow-float sm:h-96">
            <Image
              src="/illustrations/ordering_food.png"
              alt="Delivery experience preview"
              fill
              className="object-contain p-8"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
