import SummaryBar from "@/components/SummaryBar";
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

	function next() {
		const params = new URLSearchParams({ start: startDate, end: endDate, phase });
		router.push(`/select-regulation-department?${params.toString()}`);
	}

	return (
		<main className="container py-8">
			<SummaryBar />
			<Card>
				<CardHeader>
					<CardTitle>Select Time Period & Phase</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Label>Start Date</Label>
							<Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						</div>
						<div>
							<Label>End Date</Label>
							<Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
						</div>
					</div>
					<div className="space-y-2">
						<Label>Phase</Label>
						<select className="w-full border rounded-md p-2" value={phase} onChange={(e) => setPhase(e.target.value)}>
							{phases.map((p) => (
								<option key={p.id} value={p.id}>{p.label}</option>
							))}
						</select>
					</div>
					<Button onClick={next} disabled={!startDate || !endDate}>Next</Button>
				</CardContent>
			</Card>
		</main>
	);
}


