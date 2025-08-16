"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export default function ExportPage() {
	const params = useSearchParams();
	const rows = useMemo(() => {
		const raw = params.get("rows");
		try { return raw ? JSON.parse(decodeURIComponent(raw)) : []; } catch { return []; }
	}, [params]);

	function exportCSV() {
		const headers = ["Date", "Session", "Lab Name", "Subject Code", "Subject Name", "Students Allocated"];
		const csv = [headers.join(","), ...rows.map((r: any) => [r.date, r.session, r.labName, r.subjectCode, r.subjectName, r.studentsAllocated].join(","))].join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "allocations.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportPDF() {
		const doc = new jsPDF();
		doc.setFontSize(12);
		doc.text("Allocations", 14, 16);
		let y = 24;
		rows.forEach((r: any, i: number) => {
			const line = `${r.date} | ${r.session} | ${r.labName} | ${r.subjectCode} | ${r.subjectName} | ${r.studentsAllocated}`;
			doc.text(line, 14, y);
			y += 8;
			if (y > 280) { doc.addPage(); y = 20; }
		});
		doc.save("allocations.pdf");
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


