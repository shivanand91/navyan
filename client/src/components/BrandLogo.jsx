import logo from "@/assests/full_logo.png";
import { cn } from "@/lib/utils";

export default function BrandLogo({
  className,
  imageClassName,
  surface = "adaptive",
  showWordmark = false,
  subtitle
}) {
  const containerToneClass =
    surface === "adaptive" || surface === "light"
      ? "rounded-[12px] bg-[#151514] px-2.5 py-1 shadow-[0_8px_30px_rgba(20,20,15,0.06)] dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none"
      : "";

  const surfaceToneClass =
    surface === "adaptive"
      ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.14)] dark:drop-shadow-none"
      : surface === "light"
        ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:drop-shadow-none"
        : "drop-shadow-[0_6px_16px_rgba(0,0,0,0.18)] dark:drop-shadow-none";

  return (
    <div className={cn("flex items-center", containerToneClass, className)}>
      <img
        src={logo}
        alt="Navyan logo"
        className={cn(
          "h-[32px] md:h-[36px] lg:h-[40px] w-auto object-contain",
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
