import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
