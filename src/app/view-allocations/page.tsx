"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateAllocations, type AllocationRow } from "@/lib/allocation";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

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
			regulationId: params?.get("regulation_id") || "",
			phase: params?.get("phase") || "",
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

	const hasAssigned = useMemo(() => {
		return rows.some((r: any) => {
			const key = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
			return Boolean(assignedBySubjectDayLab[key]);
		});
	}, [rows, assignedBySubjectDayLab]);

	function onSelectFacultyForSubjectDayLab(subjectCode: string, date: string, labId: string, facultyId: string) {
    if (!facultyId) return;
    const f = availableFaculty.find((x) => x.id === facultyId);
    if (f && f.years_of_experience < 2) {
        toast.warning(`${f.name} has less than 2 years experience`);
        return; // do not assign
    }
    // Prevent the same teacher being allocated for other subjects on the same day
    const key = `${subjectCode}|${date}|${labId}`;
    const takenForDay = new Set(
        Object.entries(assignedBySubjectDayLab)
            .filter(([k]) => k.split('|')[1] === date && k !== key)
            .map(([, v]) => v as string)
    );
    if (takenForDay.has(facultyId)) {
        toast.error("This faculty is already assigned on this date for another subject");
        return;
    }
    setAssignedBySubjectDayLab(prev => ({ ...prev, [key]: facultyId }));
}

	function goExport() {
		try {
			// Ensure multi-dept export state does not leak into current export
			try { sessionStorage.removeItem("export_payload_multi_v1"); } catch {}
			const departmentName = params?.get("department_name") || "Department";
			const facultyDirectory: Record<string, string> = Object.fromEntries(
				availableFaculty.map((f) => [f.id, f.name])
			);
			// Only include allocations where a faculty has been assigned for this dept
			const filteredRows = rows.filter((r: any) => {
				const key = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
				return Boolean(assignedBySubjectDayLab[key]);
			});
			const payload = {
				rows: filteredRows,
				assignedFaculty: assignedBySubjectDayLab,
				facultyDirectory,
				department_id: scheduleParams.departmentId,
				department_name: departmentName,
				total_students: scheduleParams.totalStudents || 0,
				sessions_per_day: scheduleParams.sessionsPerDay || 0,
			};
			if (!filteredRows.length) {
				toast.error("No allocations assigned yet to export for this department");
				return;
			}
			sessionStorage.setItem("export_payload_v1", JSON.stringify(payload));
		} catch {}
		// Navigate with a tiny query to force a fresh render, not the large data
		router.push(`/export?from=view`);
	}

	// Local Saved Allocations per Department/Regulation/Phase
	type SavedPayload = {
		department_id: string;
		department_name: string;
		regulation_id: string;
		phase: string;
		rows: AllocationRow[];
		assignedFaculty: Record<string, string>;
		facultyDirectory: Record<string, string>;
		total_students: number;
		sessions_per_day: number;
		createdAt: number;
	};

	const [saved, setSaved] = useState<SavedPayload[]>([]);
	const [selectedSaved, setSelectedSaved] = useState<SavedPayload | null>(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem("saved_allocations_v1");
			const parsed: SavedPayload[] = raw ? JSON.parse(raw) : [];
			setSaved(Array.isArray(parsed) ? parsed : []);
		} catch {}
	}, []);

	function persistSaved(next: SavedPayload[]) {
		setSaved(next);
		try { localStorage.setItem("saved_allocations_v1", JSON.stringify(next)); } catch {}
	}

	function saveAllocationLocally() {
		if (!rows.length || !scheduleParams.departmentId || !scheduleParams.phase) {
			toast.error("Nothing to save yet");
			return;
		}
		const departmentName = params?.get("department_name") || "Department";
		const facultyDirectory: Record<string, string> = Object.fromEntries(
			availableFaculty.map((f) => [f.id, f.name])
		);
		const payload: SavedPayload = {
			department_id: scheduleParams.departmentId,
			department_name: departmentName,
			regulation_id: scheduleParams.regulationId || "",
			phase: scheduleParams.phase,
			rows,
			assignedFaculty: assignedBySubjectDayLab,
			facultyDirectory,
			total_students: scheduleParams.totalStudents || 0,
			sessions_per_day: scheduleParams.sessionsPerDay || 0,
			createdAt: Date.now(),
		};
		const existingIdx = saved.findIndex(s => s.department_id === payload.department_id && s.phase === payload.phase && s.regulation_id === payload.regulation_id);
		let next: SavedPayload[];
		if (existingIdx >= 0) {
			next = saved.slice();
			next[existingIdx] = { ...payload, createdAt: next[existingIdx].createdAt };
		} else {
			next = [...saved, payload];
		}
		persistSaved(next);
		toast.success("Allocation saved");
	}

	function removeSaved(departmentId: string) {
    const next = saved.filter(s => !(
        s.department_id === departmentId &&
        s.phase === scheduleParams.phase &&
        s.regulation_id === scheduleParams.regulationId
    ));
    persistSaved(next);
}

function onDragOver(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    try { ev.dataTransfer.dropEffect = 'move'; } catch {}
}

function startDrag(index: number, ev: React.DragEvent<HTMLDivElement>) {
    try { ev.dataTransfer.effectAllowed = 'move'; } catch {}
    ev.dataTransfer.setData("text/plain", String(index));
}

function onDrop(targetIndex: number, ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    ev.stopPropagation();
    const src = Number(ev.dataTransfer.getData("text/plain"));
    if (Number.isNaN(src) || src === targetIndex) return;
    // Reorder within filtered list and merge back into full list
    const indices = saved.map((s, i) => ({ s, i }))
        .filter(x => x.s.phase === scheduleParams.phase && x.s.regulation_id === scheduleParams.regulationId)
        .map(x => x.i);
    if (!indices.length) return;
    const subset = indices.map(i => saved[i]);
    if (!subset[src] || targetIndex < 0 || targetIndex >= subset.length) return;
    const [moved] = subset.splice(src, 1);
    subset.splice(targetIndex, 0, moved);
    const next = saved.slice();
    indices.forEach((idx, k) => { next[idx] = subset[k]; });
    persistSaved(next);
}

function viewSaved(departmentId: string) {
    const p = saved.find(s => s.department_id === departmentId && s.phase === scheduleParams.phase && s.regulation_id === scheduleParams.regulationId);
    if (!p) return;
    setSelectedSaved(p);
}

	const filteredSaved = useMemo(() => saved.filter(s => s.phase === scheduleParams.phase && s.regulation_id === scheduleParams.regulationId), [saved, scheduleParams.phase, scheduleParams.regulationId]);

	function exportAllSaved() {
		if (!filteredSaved.length) return;
		try { sessionStorage.setItem("export_payload_multi_v1", JSON.stringify(filteredSaved)); } catch {}
		router.push(`/export?multi=1`);
	}

	return (
		<main className="py-6">
			<Card className="card-enhanced">
				<CardHeader>
					<CardTitle className="text-gradient">Allocations</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-6">
						{/* Subject-wise allocations with per-day & lab internal assignment under each subject */}
						{scheduleParams.subjects.map((subj: any) => {
							const subRows = rows.filter(r => r.subjectCode === subj.code);
							const subDayLabKeys = Array.from(new Set(subRows.map(r => `${r.date}|${r.labName}|${r.labId || r.labName}`))).map(k => { const [date, labName, labId] = k.split("|"); return { date, labName, labId }; });
							return (
								<div key={subj.code} className="rounded-xl border border-border/40 overflow-hidden">
									<div className="px-4 py-3 bg-white/70 backdrop-blur-sm border-b">
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
													.map(([, v]) => v as string)
											);
											const currentKey = `${subj.code}|${date}|${labId}`;
											return (
												<div key={`${subj.code}|${date}|${labId}`} className="glass p-3 space-y-2">
													<p className="text-sm font-medium">{labName} — {date}</p>
													<Select value={assignedBySubjectDayLab[currentKey] || ""} onValueChange={(v) => onSelectFacultyForSubjectDayLab(subj.code, date, labId, v)}>
														<SelectTrigger className="mt-1">
															<SelectValue placeholder="Select faculty" />
														</SelectTrigger>
														<SelectContent side="bottom">
															{availableFaculty
																.filter((f) => !takenForDay.has(f.id) || assignedBySubjectDayLab[currentKey] === f.id)
																.map((f) => (
																	<SelectItem key={f.id} value={f.id}>{f.name} ({f.years_of_experience} YOE)</SelectItem>
																))}
														</SelectContent>
													</Select>
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
												{subRows.map((r: any, i: number) => (
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
					<div className="mt-8 space-y-3">
						<p className="text-sm font-medium">Saved Allocations</p>
						<div className="space-y-2">
							{filteredSaved.map((s, idx) => (
								<div key={`${s.department_id}-${s.phase}-${s.regulation_id}`} draggable onDragStart={(e) => startDrag(idx, e)} onDragOver={onDragOver} onDrop={(e) => onDrop(idx, e)} className="border rounded p-3 flex items-center justify-between">
									<div>
										<p className="font-medium">{s.department_name}</p>
										<p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
									</div>
									<div className="flex gap-2">
										<Button variant="secondary" onClick={() => viewSaved(s.department_id)}>View</Button>
										<Button variant="destructive" onClick={() => removeSaved(s.department_id)}>Remove</Button>
									</div>
								</div>
							))}
							{!filteredSaved.length && (
								<p className="text-sm text-muted-foreground">No saved allocations yet for this phase/regulation.</p>
							)}
						</div>
						<div className="flex flex-wrap gap-2 pt-2">
							<Button variant="secondary" onClick={goExport} disabled={!rows.length || !hasAssigned}>Export Current</Button>
							<Button onClick={saveAllocationLocally} disabled={!rows.length || !scheduleParams.departmentId || !scheduleParams.phase}>Save Allocation</Button>
							<Button variant="outline" onClick={exportAllSaved} disabled={!filteredSaved.length}>Export Saved List</Button>
						</div>
						{selectedSaved && (
							<div className="mt-6 border rounded p-4 bg-white/70">
								<p className="font-medium mb-2">Saved Summary — {selectedSaved.department_name}</p>
								<SavedSummaryPanel pack={selectedSaved} />
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

// Lightweight summary component (internal to this file)
function SavedSummaryPanel({ pack }: { pack: {
    rows: AllocationRow[];
    assignedFaculty: Record<string, string>;
    facultyDirectory: Record<string, string>;
    department_id: string; department_name: string;
    total_students: number; sessions_per_day: number;
}}) {
    const dates = Array.from(new Set(pack.rows.map((r: any) => r.date))).sort();
    const subjects = Array.from(new Set(pack.rows.map((r: any) => `${r.subjectCode}|${r.subjectName}`)));
    const totalSessions = pack.rows.length;
    const facultyIds = new Set(Object.values(pack.assignedFaculty || {}));
    const facultyNames = Array.from(facultyIds).map((id) => pack.facultyDirectory?.[String(id)] || String(id)).filter(Boolean);

    const perSubject: Array<{ code: string; name: string; sessions: number; days: number }> = subjects.map((s) => {
        const [code, name] = s.split("|");
        const group = pack.rows.filter((r: any) => r.subjectCode === code);
        const days = new Set(group.map((g: any) => g.date)).size;
        return { code, name, sessions: group.length, days };
    }).sort((a, b) => a.code.localeCompare(b.code));

    return (
        <div className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-2 rounded border bg-white">Total Subjects: <b>{subjects.length}</b></div>
                <div className="p-2 rounded border bg-white">Total Sessions: <b>{totalSessions}</b></div>
                <div className="p-2 rounded border bg-white">Unique Days: <b>{dates.length}</b></div>
                <div className="p-2 rounded border bg-white">Faculty Involved: <b>{facultyIds.size}</b></div>
            </div>
            <div>
                <p className="text-muted-foreground">Dates: {dates.join(", ") || "—"}</p>
                <p className="text-muted-foreground">Faculty: {facultyNames.join(", ") || "—"}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b">
                            <th className="py-1 pr-2">Subject</th>
                            <th className="py-1 pr-2">Code</th>
                            <th className="py-1 pr-2">Sessions</th>
                            <th className="py-1 pr-2">Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perSubject.map((p) => (
                            <tr key={p.code} className="border-b last:border-0">
                                <td className="py-1 pr-2">{p.name}</td>
                                <td className="py-1 pr-2">{p.code}</td>
                                <td className="py-1 pr-2">{p.sessions}</td>
                                <td className="py-1 pr-2">{p.days}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
