import { useEffect, useState } from "react";
import { ImageOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function InternshipImage({ src, alt, className, fit = "cover" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 bg-primary/10 px-5 text-center text-sm text-[color:var(--text-secondary)]", className)}>
        {failed ? <ImageOff className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5 text-primary" />}
        <span>Navyan internship</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("h-full w-full object-center", fit === "contain" ? "object-contain" : "object-cover", className)} />;
}
