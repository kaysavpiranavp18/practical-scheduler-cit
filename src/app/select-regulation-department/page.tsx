"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
 

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
		const search = new URLSearchParams(params?.toString());
		search.set("regulation_id", regId);
		search.set("department_id", deptId);
		// Get department name for passing to next pages
		const selectedDept = departments.find(d => d.id === deptId);
		if (selectedDept) {
			search.set("department_name", selectedDept.name);
		}
		router.push(`/enter-exam-details?${search.toString()}`);
	}

	return (
		<main className="py-6">
			<Card className="card-enhanced">
				<CardHeader>
					<CardTitle className="text-gradient">Select Regulation & Department</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<Label className="text-sm text-muted-foreground">Regulation</Label>
						<Select value={regId} onValueChange={(v) => setRegId(v)}>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select regulation" />
							</SelectTrigger>
							<SelectContent side="bottom">
								{regulations.map((r) => (
									<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label className="text-sm text-muted-foreground">Department</Label>
						<Select value={deptId} onValueChange={(v) => setDeptId(v)} disabled={!regId}>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select department" />
							</SelectTrigger>
							<SelectContent side="bottom">
								{departments.map((d) => (
									<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button className="btn-gradient" onClick={next} disabled={!regId || !deptId}>Next</Button>
				</CardContent>
			</Card>
		</main>
	);
}


