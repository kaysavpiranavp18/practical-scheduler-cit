"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SummaryBar from "@/components/SummaryBar";

type Subject = { name: string; code: string };

export default function EnterExamDetails() {
	const params = useSearchParams();
	const router = useRouter();
	const [students, setStudents] = useState<number>(0);
	const [sessionsPerDay, setSessionsPerDay] = useState<number>(2);
	const [numSubjects, setNumSubjects] = useState<number>(1);
	const [subjects, setSubjects] = useState<Subject[]>([{ name: "", code: "" }]);

	function updateSubject(idx: number, key: keyof Subject, val: string) {
		setSubjects((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));
	}

	function onNumSubjectsChange(n: number) {
		setNumSubjects(n);
		setSubjects((prev) => {
			const next = [...prev];
			while (next.length < n) next.push({ name: "", code: "" });
			return next.slice(0, n);
		});
	}

	function next() {
		const search = new URLSearchParams(params?.toString());
		search.set("total_students", String(students));
		search.set("sessions_per_day", String(sessionsPerDay));
		search.set("subjects", encodeURIComponent(JSON.stringify(subjects)));
		// Pass department name forward
		const departmentName = params?.get("department_name");
		if (departmentName) {
			search.set("department_name", departmentName);
		}
		router.push(`/view-allocations?${search.toString()}`);
	}

	return (
		<main className="container py-8">
			<SummaryBar
				cycle={params?.get("cycle") || undefined}
				phase={params?.get("phase") || undefined}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Enter Exam Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<Label>Total Students</Label>
							<Input type="number" value={students || ""} onChange={(e) => setStudents(Number(e.target.value))} />
						</div>
						<div>
							<Label>Sessions per day</Label>
							<Input type="number" min={1} value={sessionsPerDay} onChange={(e) => setSessionsPerDay(Number(e.target.value))} />
						</div>
						<div>
							<Label>Number of subjects</Label>
							<Input type="number" min={1} value={numSubjects} onChange={(e) => onNumSubjectsChange(Number(e.target.value))} />
						</div>
					</div>
					<div className="space-y-3">
						{Array.from({ length: numSubjects }).map((_, i) => (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2" key={i}>
								<div>
									<Label>Subject Name #{i + 1}</Label>
									<Input value={subjects[i]?.name || ""} onChange={(e) => updateSubject(i, "name", e.target.value)} />
								</div>
								<div>
									<Label>Subject Code #{i + 1}</Label>
									<Input value={subjects[i]?.code || ""} onChange={(e) => updateSubject(i, "code", e.target.value)} />
								</div>
							</div>
						))}
					</div>
					<Button onClick={next} disabled={!students || subjects.some((s) => !s.name || !s.code)}>Next</Button>
				</CardContent>
			</Card>
		</main>
	);
}


