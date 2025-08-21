"use client";
import { useEffect, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
 

const phases = [
  { id: "phase-1", label: "Phase 1 → IV Year (R2022)", map: { years: [4], regs: ["R2022"] } },
  { id: "phase-2", label: "Phase 2 → II & III Year (R2024, R2022)", map: { years: [2, 3], regs: ["R2024", "R2022"] } },
  { id: "phase-3", label: "Phase 3 → I Year (R2025)", map: { years: [1], regs: ["R2025"] } },
];

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cycle, setCycle] = useState<string>("Nov/Dec");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phase, setPhase] = useState<string>("phase-1");

  useEffect(() => {
    const cycleParam = searchParams?.get("cycle");
    const phaseParam = searchParams?.get("phase");
    if (cycleParam) setCycle(cycleParam);
    if (phaseParam) setPhase(phaseParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function replaceQuery(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(next).forEach(([k, v]) => params.set(k, v));
    const path = pathname || "/";
    router.replace((`${path}?${params.toString()}` as unknown) as Route, { scroll: false });
  }

  function next() {
    const params = new URLSearchParams({ start: startDate, end: endDate, phase, cycle });
    router.push(`/select-regulation-department?${params.toString()}`);
  }

  return (
    <main className="py-6">
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-gradient">Select Time Period & Phase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <Label className="text-sm text-muted-foreground">Cycle</Label>
              <Select value={cycle} onValueChange={(v) => { setCycle(v); replaceQuery({ cycle: v }); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="Nov/Dec">Nov/Dec</SelectItem>
                  <SelectItem value="Apr/May">Apr/May</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Start Date</Label>
              <Input className="input-enhanced mt-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">End Date</Label>
              <Input className="input-enhanced mt-1" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Phase</Label>
            <Select value={phase} onValueChange={(v) => { setPhase(v); replaceQuery({ phase: v }); }}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {phases.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="btn-gradient" onClick={next} disabled={!startDate || !endDate}>Next</Button>
        </CardContent>
      </Card>
    </main>
  );
}
