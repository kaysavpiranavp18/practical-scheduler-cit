"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function SelectTimeAndPhase() {
	const router = useRouter();
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [phase, setPhase] = useState<string>("phase-1");
	const today = new Date().toISOString().split("T")[0];

	function next() {
		const params = new URLSearchParams({ start: startDate, end: endDate, phase });
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
						<div>
							<Label className="text-sm text-muted-foreground">Start Date</Label>
							<Input
								className="input-enhanced mt-1"
								type="date"
								min={today}
								value={startDate}
								onChange={(e) => {
									const v = e.target.value;
									const clamped = v && v < today ? today : v;
									setStartDate(clamped);
									if (endDate && clamped && endDate < clamped) setEndDate(clamped);
								}}
							/>
						</div>
						<div>
							<Label className="text-sm text-muted-foreground">End Date</Label>
							<Input
								className="input-enhanced mt-1"
								type="date"
								min={startDate || today}
								value={endDate}
								onChange={(e) => {
									const v = e.target.value;
									const min = startDate || today;
									const clamped = v && v < min ? min : v;
									setEndDate(clamped);
								}}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label className="text-sm text-muted-foreground">Phase</Label>
						<Select value={phase} onValueChange={(v) => setPhase(v)}>
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
					<Button className="btn-gradient" onClick={next} disabled={!startDate || !endDate || endDate < startDate}>Next</Button>
				</CardContent>
			</Card>
		</main>
	);
}
