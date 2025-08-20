"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export default function ExportPage() {
	const params = useSearchParams();
	const rows = useMemo(() => {
		try {
			const payload = typeof window !== 'undefined' ? sessionStorage.getItem("export_payload_v1") : null;
			if (payload) {
				const parsed = JSON.parse(payload);
				if (Array.isArray(parsed?.rows)) return parsed.rows;
			}
		} catch {}
		const raw = params?.get("rows");
		try { return raw ? JSON.parse(decodeURIComponent(raw)) : []; } catch { return []; }
	}, [params]);
	
	const assignedFaculty = useMemo(() => {
		try {
			const payload = typeof window !== 'undefined' ? sessionStorage.getItem("export_payload_v1") : null;
			if (payload) {
				const parsed = JSON.parse(payload);
				if (parsed?.assignedFaculty && typeof parsed.assignedFaculty === 'object') return parsed.assignedFaculty;
			}
		} catch {}
		const raw = params?.get("assignedFaculty");
		try { return raw ? JSON.parse(decodeURIComponent(raw)) : {}; } catch { return {}; }
	}, [params]);

	const facultyDirectory = useMemo(() => {
		try {
			const payload = typeof window !== 'undefined' ? sessionStorage.getItem("export_payload_v1") : null;
			if (payload) {
				const parsed = JSON.parse(payload);
				if (parsed?.facultyDirectory && typeof parsed.facultyDirectory === 'object') return parsed.facultyDirectory;
			}
		} catch {}
		const raw = params?.get("faculty_directory");
		try { return raw ? JSON.parse(decodeURIComponent(raw)) : {}; } catch { return {}; }
	}, [params]);

	const meta = useMemo(() => {
		try {
			const payload = typeof window !== 'undefined' ? sessionStorage.getItem("export_payload_v1") : null;
			if (payload) {
				const parsed = JSON.parse(payload);
				return {
					department_id: parsed?.department_id || params?.get("department_id") || "",
					department_name: parsed?.department_name || params?.get("department_name") || "Department",
					total_students: Number(parsed?.total_students ?? (params?.get("total_students") || 0)),
					sessions_per_day: Number(parsed?.sessions_per_day ?? (params?.get("sessions_per_day") || 0)),
				};
			}
		} catch {}
		return {
			department_id: params?.get("department_id") || "",
			department_name: params?.get("department_name") || "Department",
			total_students: Number(params?.get("total_students") || 0),
			sessions_per_day: Number(params?.get("sessions_per_day") || 0),
		};
	}, [params]);

	function exportCSV() {
		const headers = ["Date", "Session", "Time", "Lab Name", "Subject Code", "Subject Name", "Students Allocated", "Assigned Faculty"];
		
		// Create CSV content with proper escaping for multiple subjects
		const csvRows = rows.map((r: any) => {
			// Get faculty from the assigned faculty data
			const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
			const facultyName = assignedFaculty[facultyKey] || "Not Assigned";
			
			return [
				r.date,
				r.session,
				r.time,
				`"${r.labName}"`,
				r.subjectCode,
				`"${r.subjectName}"`,
				r.studentsAllocated,
				facultyName
			].join(",");
		});
		
		const csv = [headers.join(","), ...csvRows].join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "allocations.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportPDF() {
		const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
		const page = { width: 210, height: 297, margin: 12 };

		// header
		const drawHeader = () => {
			doc.setFontSize(14);
			doc.text("ANNA UNIVERSITY :: CHENNAI - 600 025", page.margin, 16);
			doc.text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", page.margin, 24);
			doc.setFontSize(11);
			doc.text("APRIL / MAY EXAMINATION,2025 EXAMINATIONS", page.margin, 32);
			doc.setFontSize(12);
			doc.text("Internal Examiner Allotted Report", page.margin, 42);
			const institutionCode = meta?.department_id || "";
			const departmentName = meta?.department_name || "Department";
			doc.setFontSize(10);
			doc.text(`Institution Code - Name : ${institutionCode} - ${departmentName}`, page.margin, 52);
			doc.text("Slot Code - Slot Name : 1 - UG/PG_ALL_REGULATIONS_EXCEPT(PG_PW_VIVA_VOCE)", page.margin, 60);
		};

		const drawBranchHeader = (y: number) => {
			const branch = `${meta?.department_id || ""} - ${meta?.department_name || "Department"} [ AUC ]`;
			doc.setFontSize(9);
			doc.text(`Branch Code - Branch Name [ University ] : ${branch}`, page.margin, y);
			return y + 6;
		};

		type SessionRow = { sessionNo: number; date: string; time: string; students: number; facultyNames: string };
		const bySubject: Record<string, { subjectName: string; subjectCode: string; sessions: SessionRow[] }> = {};
		const sessionMap: Record<string, { students: number; time: string; facultyIds: Set<string> }> = {};

		(rows as any[]).forEach((r: any) => {
			const subKey = r.subjectCode as string;
			const sessKey = `${r.subjectCode}|${r.date}|${r.session}`;
			if (!sessionMap[sessKey]) sessionMap[sessKey] = { students: 0, time: r.time, facultyIds: new Set<string>() };
			sessionMap[sessKey].students += Number(r.studentsAllocated || 0);
			const fKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
			const fId = (assignedFaculty as any)[fKey];
			if (fId) sessionMap[sessKey].facultyIds.add(String(fId));
			if (!bySubject[subKey]) bySubject[subKey] = { subjectName: r.subjectName, subjectCode: r.subjectCode, sessions: [] };
		});

		Object.entries(sessionMap)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.forEach(([key, val]) => {
				const [subjectCode, date, sessionStr] = key.split("|");
				const names = Array.from(val.facultyIds).map((id) => (facultyDirectory as any)[id] || id).join(", ") || "Not Assigned";
				bySubject[subjectCode].sessions.push({ sessionNo: Number(sessionStr), date, time: val.time, students: val.students, facultyNames: names });
			});

		drawHeader();
		let y = drawBranchHeader(70);

		const drawTableHeader = () => {
			doc.setFontSize(9);
			const x = page.margin;
			doc.text("Semester", x, y);
			doc.text("Subject", x + 20, y);
			doc.text("Total Student", x + 90, y);
			doc.text("No. of Session", x + 116, y);
			doc.text("Session No.", x + 142, y);
			doc.text("Student per Session", x + 162, y);
			doc.text("Date", x + 190, y);
			doc.text("Time", x + 205, y);
			doc.text("Internal Examiner Staff Code/Staff Name", x + 150, y + 6, { maxWidth: 200 } as any);
			y += 8;
			doc.line(page.margin, y, page.width - page.margin, y);
			y += 4;
		};

		const ensureSpace = (min: number) => {
			if (y + min > page.height - 20) {
				doc.addPage();
				drawHeader();
				y = drawBranchHeader(70);
				drawTableHeader();
			}
		};

		drawTableHeader();
		const totalStudentsPerSubject = Number(meta?.total_students ?? 0);

		Object.values(bySubject).forEach((sub) => {
			sub.sessions.sort((a, b) => (a.date === b.date ? a.sessionNo - b.sessionNo : a.date.localeCompare(b.date)));
			const numSessions = sub.sessions.length;
			sub.sessions.forEach((s, idx) => {
				ensureSpace(10);
				const x = page.margin;
				if (idx === 0) {
					doc.text("04", x, y);
					doc.text(`${sub.subjectCode} - ${sub.subjectName}`, x + 20, y, { maxWidth: 65 } as any);
					doc.text(String(totalStudentsPerSubject || s.students), x + 96, y);
					doc.text(String(numSessions), x + 124, y);
				}
				doc.text(String(s.sessionNo), x + 146, y);
				doc.text(String(s.students), x + 170, y);
				doc.text(new Date(s.date).toLocaleDateString('en-GB'), x + 190, y);
				doc.text(s.time, x + 205, y);
				doc.text(s.facultyNames, x + 150, y + 6, { maxWidth: 200 } as any);
				y += 8;
			});
			y += 2;
		});

		doc.setFontSize(8);
		doc.text(new Date().toLocaleDateString(), page.margin, page.height - 10);
		doc.text("Anna University - COE", page.width - 60, page.height - 10);
		doc.save("Internal_Examiner_Allotted_Report.pdf");
	}

	return (
		<main className="container py-8 space-y-4">
			<div className="flex gap-3">
				<Button onClick={exportCSV} disabled={!rows.length}>Download CSV</Button>
				<Button onClick={exportPDF} disabled={!rows.length}>Download PDF</Button>
			</div>
			<p className="text-sm text-muted-foreground">Return to previous page to regenerate allocations if needed.</p>
		</main>
	);
}


