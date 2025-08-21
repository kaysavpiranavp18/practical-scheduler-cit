"use client";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalSubtitle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const text = useMemo(() => {
    const sp = searchParams;
    const cycle = ((sp && sp.get("cycle")) || "Nov/Dec").toUpperCase();
    const phaseParam = (sp && sp.get("phase")) || "phase-1";
    const phaseNumber = phaseParam.match(/\d+/)?.[0] ?? "1";
    return `END-SEMESTER PRACTICAL EXAMINATIONS - ${cycle} (PHASE ${phaseNumber})`;
  }, [searchParams]);

  // Hide on auth/admin pages if needed in future
  if (!pathname) return null;

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-border">
      <div className="container py-3">
        <p className="text-center text-sm md:text-base font-semibold text-muted-foreground tracking-wide uppercase">
          {text}
        </p>
      </div>
    </div>
  );
}
