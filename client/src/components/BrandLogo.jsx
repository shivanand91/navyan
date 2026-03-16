import logo from "@/assests/Navyan.svg";
import { cn } from "@/lib/utils";

export default function BrandLogo({
  className,
  imageClassName,
  surface = "dark",
  showWordmark = false,
  subtitle
}) {
  const surfaceToneClass =
    surface === "adaptive"
      ? "mix-blend-multiply [filter:brightness(0.64)_contrast(1.14)_saturate(1.06)] dark:mix-blend-normal dark:[filter:none]"
      : surface === "light"
        ? "mix-blend-multiply [filter:brightness(0.64)_contrast(1.14)_saturate(1.06)]"
        : "drop-shadow-[0_12px_28px_rgba(0,0,0,0.18)] dark:drop-shadow-none";

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={logo}
        alt="Navyan logo"
        className={cn(
          "h-14 w-auto object-contain md:h-16 lg:h-20",
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
