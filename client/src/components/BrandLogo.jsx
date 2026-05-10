import logo from "@/assests/full_logo.png";
import { cn } from "@/lib/utils";

export default function BrandLogo({
  className,
  imageClassName,
  surface = "dark",
  showWordmark = false,
  subtitle
}) {
  const containerToneClass =
    surface === "adaptive" || surface === "light"
      ? "rounded-[22px] bg-[#061432] px-2.5 py-1.5 shadow-[0_14px_34px_rgba(6,20,50,0.18)] dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none"
      : "";

  const surfaceToneClass =
    surface === "adaptive"
      ? "drop-shadow-[0_10px_24px_rgba(0,0,0,0.14)] dark:drop-shadow-none"
      : surface === "light"
        ? "drop-shadow-[0_10px_24px_rgba(0,0,0,0.12)] dark:drop-shadow-none"
        : "drop-shadow-[0_12px_28px_rgba(0,0,0,0.18)] dark:drop-shadow-none";

  return (
    <div className={cn("flex items-center", containerToneClass, className)}>
      <img
        src={logo}
        alt="Navyan logo"
        className={cn(
          "h-16 w-auto object-contain md:h-20 lg:h-24",
          surfaceToneClass,
          imageClassName
        )}
      />

      {showWordmark ? (
        <span className="sr-only">{subtitle || "Navyan"}</span>
      ) : null}
    </div>
  );
}
