"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export default function ReloadRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Detect hard reloads
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = nav?.type === "reload";
    if (isReload) {
      router.replace("/" as Route);
    }
  }, [router]);

  return null;
}
