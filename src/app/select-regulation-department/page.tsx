"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SummaryBar from "@/components/SummaryBar";

type Option = { id: string; name: string };

export default function SelectRegulationDepartment() {
	const params = useSearchParams();
	const router = useRouter();
	const [regulations, setRegulations] = useState<Option[]>([]);
	const [departments, setDepartments] = useState<Option[]>([]);
	const [regId, setRegId] = useState("");
	const [deptId, setDeptId] = useState("");

	useEffect(() => {
		async function load() {
			const { data: regs } = await supabase.from("regulations").select("id, name");
			setRegulations(regs || []);
		}
		load();
	}, []);

	useEffect(() => {
		async function loadDepts() {
			if (!regId) return;
			const { data: depts } = await supabase
				.from("departments")
				.select("id, name")
				.eq("regulation_id", regId);
			setDepartments(depts || []);
		}
		loadDepts();
	}, [regId]);

	function next() {
		const search = new URLSearchParams(params.toString());
		search.set("regulation_id", regId);
		search.set("department_id", deptId);
		router.push(`/enter-exam-details?${search.toString()}`);
	}

	return (
		<main className="container py-8">
			<SummaryBar
				cycle={params.get("cycle") || undefined}
				phase={params.get("phase") || undefined}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Select Regulation & Department</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label>Regulation</Label>
						<select className="w-full border rounded-md p-2" value={regId} onChange={(e) => setRegId(e.target.value)}>
							<option value="">Select regulation</option>
							{regulations.map((r) => (
								<option key={r.id} value={r.id}>{r.name}</option>
							))}
						</select>
					</div>
					<div>
						<Label>Department</Label>
						<select className="w-full border rounded-md p-2" value={deptId} onChange={(e) => setDeptId(e.target.value)} disabled={!regId}>
							<option value="">Select department</option>
							{departments.map((d) => (
								<option key={d.id} value={d.id}>{d.name}</option>
							))}
						</select>
					</div>
					<Button onClick={next} disabled={!regId || !deptId}>Next</Button>
				</CardContent>
			</Card>
		</main>
	);
}


