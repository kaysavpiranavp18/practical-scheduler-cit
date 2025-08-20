"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateAllocations, type AllocationRow } from "@/lib/allocation";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import SummaryBar from "@/components/SummaryBar";

type Faculty = { id: string; name: string; years_of_experience: number };

export default function ViewAllocations() {
	const params = useSearchParams();
	const router = useRouter();
	const [labs, setLabs] = useState<{ id: string; name: string; capacity: number }[]>([]);
	const [faculty, setFaculty] = useState<Faculty[]>([]);
	const [assignedFacultyIds, setAssignedFacultyIds] = useState<Set<string>>(new Set());
	// Deprecated: subject-level selection removed in favor of day+lab assignment
	// const [selectedFacultyBySubject, setSelectedFacultyBySubject] = useState<Record<string, string>>({});

	// Fallback sample faculty for all departments (used when DB has none)
	const sampleFaculty: Faculty[] = [
		{ id: "sample-1", name: "Dr. Anitha R", years_of_experience: 8 },
		{ id: "sample-2", name: "Prof. Balaji S", years_of_experience: 1 },
		{ id: "sample-3", name: "Dr. Chitra K", years_of_experience: 5 },
		{ id: "sample-4", name: "Prof. Dinesh M", years_of_experience: 3 },
		{ id: "sample-5", name: "Dr. Elango V", years_of_experience: 12 },
		{ id: "sample-6", name: "Prof. Farhana T", years_of_experience: 2 },
		{ id: "sample-7", name: "Dr. Gopal R", years_of_experience: 9 },
		{ id: "sample-8", name: "Prof. Harini P", years_of_experience: 4 },
		{ id: "sample-9", name: "Dr. Ismail A", years_of_experience: 7 },
		{ id: "sample-10", name: "Prof. Jayanth K", years_of_experience: 6 },
	];

	const availableFaculty: Faculty[] = faculty.length ? faculty : sampleFaculty;

	const scheduleParams = useMemo(() => {
		return {
			startDate: params?.get("start") || "",
			endDate: params?.get("end") || "",
			sessionsPerDay: Number(params?.get("sessions_per_day") || 2),
			totalStudents: Number(params?.get("total_students") || 0),
			departmentId: params?.get("department_id") || "",
			cycle: params?.get("cycle") || "",
			subjects: (() => {
				const raw = params?.get("subjects");
				if (!raw) return [] as { name: string; code: string }[];
				try { return JSON.parse(decodeURIComponent(raw)); } catch { return []; }
			})(),
		};
	}, [params]);

	useEffect(() => {
		async function loadLabs() {
			if (!scheduleParams.departmentId) return;
			const { data } = await supabase
				.from("labs")
				.select("id, name, capacity, department_id")
				.eq("department_id", scheduleParams.departmentId);
			setLabs((data as any[] | null || []).map((l: any) => ({ id: l.id, name: l.name, capacity: l.capacity })));
		}
		async function loadFaculty() {
			if (!scheduleParams.departmentId) return;
			const deptId = scheduleParams.departmentId;
			const { data } = await supabase
				.from("faculty")
				.select("id, name, years_of_experience, department")
				.or(`department.eq.${deptId},department_id.eq.${deptId}` as any);
			setFaculty(((data as any[] | null) || []).map((f: any) => ({ id: f.id, name: f.name, years_of_experience: f.years_of_experience })));
		}
		loadLabs();
		loadFaculty();
	}, [scheduleParams.departmentId]);

	// removed subject-level persistence

	const rows: AllocationRow[] = useMemo(() => {
		if (!scheduleParams.startDate || !scheduleParams.endDate) return [];
		return generateAllocations({
			startDate: scheduleParams.startDate,
			endDate: scheduleParams.endDate,
			sessionsPerDay: scheduleParams.sessionsPerDay,
			totalStudents: scheduleParams.totalStudents,
			labs,
			subjects: scheduleParams.subjects,
		});
	}, [scheduleParams, labs]);

	// Build per-day, per-lab keys
	const dayLabKeys = useMemo(() => {
		const set = new Set<string>();
		rows.forEach(r => set.add(`${r.date}|${r.labName}|${r.labId || r.labName}`));
		return Array.from(set).map(k => {
			const [date, labName, labId] = k.split("|");
			return { date, labName, labId };
		});
	}, [rows]);

	// subject|date|lab -> facultyId
	const [assignedBySubjectDayLab, setAssignedBySubjectDayLab] = useState<Record<string, string>>({});

	function onSelectFacultyForSubjectDayLab(subjectCode: string, date: string, labId: string, facultyId: string) {
		if (!facultyId) return;
		const f = availableFaculty.find((x) => x.id === facultyId);
		if (f && f.years_of_experience < 2) {
			toast.warning(`${f.name} has less than 2 years experience`);
			return; // do not assign
		}
		const key = `${subjectCode}|${date}|${labId}`;
		setAssignedBySubjectDayLab(prev => ({ ...prev, [key]: facultyId }));
	}

	function goExport() {
		// Persist payload in sessionStorage to avoid long URLs breaking the export
		try {
			const departmentName = params?.get("department_name") || "Department";
			const facultyDirectory: Record<string, string> = Object.fromEntries(
				availableFaculty.map((f) => [f.id, f.name])
			);
			const payload = {
				rows,
				assignedFaculty: assignedBySubjectDayLab,
				facultyDirectory,
				department_id: scheduleParams.departmentId,
				department_name: departmentName,
				total_students: scheduleParams.totalStudents || 0,
				sessions_per_day: scheduleParams.sessionsPerDay || 0,
			};
			sessionStorage.setItem("export_payload_v1", JSON.stringify(payload));
		} catch {}
		// Navigate with a tiny query to force a fresh render, not the large data
		router.push(`/export?from=view`);
	}

	async function saveToSupabase() {
		await fetch("/api/allocations", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				department_id: scheduleParams.departmentId,
				subjects: scheduleParams.subjects,
				start: scheduleParams.startDate,
				end: scheduleParams.endDate,
				sessions_per_day: scheduleParams.sessionsPerDay,
				total_students: scheduleParams.totalStudents,
				faculty_by_subject_day_lab: assignedBySubjectDayLab,
			}),
		});
	}

	return (
		<main className="container py-8">
			<SummaryBar cycle={scheduleParams.cycle || undefined} phase={params?.get("phase") || undefined} />
			<Card>
				<CardHeader>
					<CardTitle>Allocations</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-6">
						{/* Subject-wise allocations with per-day & lab internal assignment under each subject */}
						{scheduleParams.subjects.map((subj: any) => {
							const subRows = rows.filter(r => r.subjectCode === subj.code);
							const subDayLabKeys = Array.from(new Set(subRows.map(r => `${r.date}|${r.labName}|${r.labId || r.labName}`))).map(k => { const [date, labName, labId] = k.split("|"); return { date, labName, labId }; });
							return (
								<div key={subj.code} className="border rounded-md">
									<div className="px-4 py-3 bg-muted/40 border-b">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">{subj.name} ({subj.code})</p>
												<p className="text-sm text-muted-foreground">Total students: {scheduleParams.totalStudents}</p>
											</div>
										</div>
									</div>

									<div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
										{subDayLabKeys.map(({ date, labName, labId }) => {
											// Exclude any faculty already selected on this date across ANY subject
											const takenForDay = new Set(
												Object.entries(assignedBySubjectDayLab)
													.filter(([k]) => k.split('|')[1] === date)
													.map(([, v]) => v)
											);
											const currentKey = `${subj.code}|${date}|${labId}`;
											return (
												<div key={`${subj.code}|${date}|${labId}`} className="border rounded p-3 space-y-2">
													<p className="text-sm font-medium">{labName} — {date}</p>
													<select
														className="w-full border rounded-md p-2"
														value={assignedBySubjectDayLab[currentKey] || ""}
														onChange={(e) => onSelectFacultyForSubjectDayLab(subj.code, date, labId, e.target.value)}
													>
														<option value="">Select faculty</option>
														{availableFaculty
															.filter((f) => !takenForDay.has(f.id) || assignedBySubjectDayLab[currentKey] === f.id)
															.map((f) => (
																<option key={f.id} value={f.id}>{f.name} ({f.years_of_experience} YOE)</option>
															))}
													</select>
												</div>
											);
										})}
									</div>

									<div className="overflow-x-auto p-4">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Session</TableHead>
													<TableHead>Time</TableHead>
													<TableHead>Lab</TableHead>
													<TableHead>Students</TableHead>
													<TableHead>Assigned Faculty</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{subRows.map((r, i) => (
													<TableRow key={i}>
														<TableCell>{r.date}</TableCell>
														<TableCell>{r.session}</TableCell>
														<TableCell>{r.time}</TableCell>
														<TableCell>{r.labName}</TableCell>
														<TableCell>{r.studentsAllocated}</TableCell>
														<TableCell>{availableFaculty.find(f => f.id === assignedBySubjectDayLab[`${subj.code}|${r.date}|${r.labId || r.labName}`])?.name || "—"}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</div>
							);
						})}
					</div>
					<div className="flex gap-3">
						<Button onClick={goExport} disabled={!rows.length}>Export</Button>
						<Button variant="secondary" onClick={saveToSupabase} disabled={!rows.length || !scheduleParams.departmentId}>Save to Supabase</Button>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}


