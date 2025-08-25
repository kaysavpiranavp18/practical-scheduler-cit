"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

/* Types */
interface Row {
  date: string;
  session: string;
  time: string;
  labId?: string;
  labName: string;
  subjectCode: string;
  subjectName: string;
  studentsAllocated: number;
  department_id?: string;
  department_name?: string;
}

type AssignedFacultyMap = Record<string, string>;

interface SavedAllocation {
  department_id: string;
  department_name: string;
  rows: Row[];
  assignedFaculty: AssignedFacultyMap;
  createdAt: string;
}

export default function ExportPage() {
<<<<<<< HEAD
  const params = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [assignedFaculty, setAssignedFaculty] = useState<AssignedFacultyMap>({});
  const [savedAllocations, setSavedAllocations] = useState<SavedAllocation[]>([]);
  const [isMultiExport, setIsMultiExport] = useState(false);
=======
	const params = useSearchParams();
	const multiSaved = useMemo(() => {
		try {
			const isMulti = params?.get("multi") === "1";
			if (!isMulti) return null;
			const raw = typeof window !== 'undefined' ? sessionStorage.getItem("export_payload_multi_v1") : null;
			return raw ? JSON.parse(raw) : null;
		} catch { return null; }
	}, [params]);
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
>>>>>>> ab508c11417096636cd1362dfbd053dfdd9d4919

  useEffect(() => {
    try {
      // Check if this is a multi-export (all saved allocations)
      const multiParam = params?.get("multi");
      if (multiParam === "1") {
        const multiPayload = sessionStorage.getItem("export_payload_multi_v1");
        if (multiPayload) {
          const parsed = JSON.parse(multiPayload);
          if (Array.isArray(parsed)) {
            setSavedAllocations(parsed);
            setIsMultiExport(true);
            return;
          }
        }
      }

      // Single allocation export (existing functionality)
      const payload = sessionStorage.getItem("export_payload_v1");
      if (payload) {
        const parsed = JSON.parse(payload);
        if (Array.isArray(parsed?.rows)) setRows(parsed.rows);
        if (parsed?.assignedFaculty) setAssignedFaculty(parsed.assignedFaculty);
      } else {
        const rawRows = params?.get("rows");
        if (rawRows) setRows(JSON.parse(decodeURIComponent(rawRows)));
        const rawFaculty = params?.get("assignedFaculty");
        if (rawFaculty) setAssignedFaculty(JSON.parse(decodeURIComponent(rawFaculty)));
      }
    } catch (e) {
      console.error("Error loading payload:", e);
    }
  }, [params]);

<<<<<<< HEAD
  /* CSV Export for single allocation */
  const exportCSV = () => {
    const headers = [
      "Department ID",
      "Department",
      "Date",
      "Session",
      "Time",
      "Lab Name",
      "Subject Code",
      "Subject Name",
      "Students Allocated",
      "Assigned Faculty",
    ];
=======
	function exportCSV() {
        // If multiple saved packs exist, include department columns and flatten all rows preserving order
        const packs = Array.isArray(multiSaved) && multiSaved.length
            ? multiSaved
            : [{
                rows,
                assignedFaculty,
                facultyDirectory,
                department_id: meta.department_id,
                department_name: meta.department_name,
            }];

        const headers = [
            ...(packs.length > 1 ? ["Department ID", "Department Name"] : []),
            "Date", "Session", "Time", "Lab Name", "Subject Code", "Subject Name", "Students Allocated", "Assigned Faculty"
        ];

        const csvRows: string[] = [];
        packs.forEach((pack: any) => {
            const localRows: any[] = pack.rows || [];
            const localAssigned: Record<string, string> = pack.assignedFaculty || {};
            const localDir: Record<string, string> = pack.facultyDirectory || {};
            const deptId = pack.department_id || meta.department_id;
            const deptName = pack.department_name || meta.department_name;

            localRows.forEach((r: any) => {
                const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
                const facultyId = (localAssigned as any)[facultyKey];
                const facultyName = (localDir as any)[String(facultyId)] || facultyId || "Not Assigned";
                const base = [
                    r.date,
                    r.session,
                    r.time,
                    `"${String(r.labName).replace(/\"/g, '""')}"`,
                    r.subjectCode,
                    `"${String(r.subjectName).replace(/\"/g, '""')}"`,
                    r.studentsAllocated,
                    `"${String(facultyName).replace(/\"/g, '""')}"`,
                ];
                const row = packs.length > 1
                    ? [deptId, `"${String(deptName).replace(/\"/g, '""')}"`, ...base]
                    : base;
                csvRows.push(row.join(","));
            });
        });

        const csv = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = packs.length > 1 ? "allocations_all_departments.csv" : "allocations.csv";
        a.click();
        URL.revokeObjectURL(url);
}
>>>>>>> ab508c11417096636cd1362dfbd053dfdd9d4919

    const csvRows = rows.map((r) => {
      const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
      const facultyName = assignedFaculty[facultyKey] || "Not Assigned";
      return [
        r.department_id || "",
        `"${r.department_name || ""}"`,
        r.date,
        r.session,
        r.time,
        `"${r.labName}"`,
        r.subjectCode,
        `"${r.subjectName}"`,
        r.studentsAllocated,
        facultyName,
      ].join(",");
    });

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Internal_Examiner_Allotted_Report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* Excel Export for all saved allocations */
  const exportAllExcel = () => {
    if (!savedAllocations.length) return;

    const workbook = XLSX.utils.book_new();
    
    // Create a summary sheet with all departments
    const summaryData = savedAllocations.map((allocation, index) => [
      index + 1,
      allocation.department_id,
      allocation.department_name,
      allocation.rows.length,
      new Date(allocation.createdAt).toLocaleDateString(),
    ]);

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["#", "Department ID", "Department Name", "Total Allocations", "Created Date"],
      ...summaryData
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Create individual sheets for each department
    savedAllocations.forEach((allocation) => {
      const headers = [
        "Date",
        "Session", 
        "Time",
        "Lab Name",
        "Subject Code",
        "Subject Name",
        "Students Allocated",
        "Assigned Faculty",
      ];

      const sheetData = allocation.rows.map((r) => {
        const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
        const facultyName = allocation.assignedFaculty[facultyKey] || "Not Assigned";
        return [
          r.date,
          r.session,
          r.time,
          r.labName,
          r.subjectCode,
          r.subjectName,
          r.studentsAllocated,
          facultyName,
        ];
      });

      const sheet = XLSX.utils.aoa_to_sheet([headers, ...sheetData]);
      XLSX.utils.book_append_sheet(workbook, sheet, allocation.department_name || allocation.department_id);
    });

    // Save the file
    XLSX.writeFile(workbook, "All_Departments_Allocation_Report.xlsx");
  };

  /* PDF Export for single allocation */
  const exportPDF = async () => {
    const doc = new jsPDF();

    // Load logo from public folder with increased size
    const logoUrl = "/Anna University logo.png"; // public folder path
    const logoImg = new Image();
    logoImg.src = logoUrl;

    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        // Increased logo size from 20x20 to 35x35
        doc.addImage(logoImg, "PNG", 14, 10, 35, 35);
        resolve();
      };
      logoImg.onerror = () => reject(new Error("Failed to load logo image"));
    });

    // Header text - adjusted Y positions to accommodate larger logo
    doc.setFontSize(14);
    doc.text("ANNA UNIVERSITY :: CHENNAI - 600 025", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", 105, 32, { align: "center" });
    doc.setFontSize(13);
    doc.text("Internal Examiner Allotted Report", 105, 47, { align: "center" });

<<<<<<< HEAD
    let y = 57; // Adjusted starting Y position

    // Group rows by department
    const grouped = rows.reduce((acc, row) => {
      const dept = row.department_id || "NA";
      if (!acc[dept]) acc[dept] = { name: row.department_name || "", rows: [] };
      acc[dept].rows.push(row);
      return acc;
    }, {} as Record<string, { name: string; rows: Row[] }>);
=======
		if (Array.isArray(multiSaved) && multiSaved.length) {
			multiSaved.forEach((pack: any, idx: number) => {
				if (idx > 0) doc.addPage();
				renderOne(pack);
			});
			// Prefer opening in a new tab via blob URL (reduces Chrome insecure download warnings)
			try {
				const url = doc.output('bloburl');
				const w = window.open(url, '_blank', 'noopener,noreferrer');
				if (!w) throw new Error('popup blocked');
			} catch {
				doc.save("Internal_Examiner_Allotted_Report_All_Departments.pdf");
			}
			return;
		}

		renderOne({});
		try {
			const url = doc.output('bloburl');
			const w = window.open(url, '_blank', 'noopener,noreferrer');
			if (!w) throw new Error('popup blocked');
		} catch {
			doc.save("Internal_Examiner_Allotted_Report.pdf");
		}
	}
>>>>>>> ab508c11417096636cd1362dfbd053dfdd9d4919

    for (const deptId of Object.keys(grouped)) {
      const dept = grouped[deptId];

      doc.setFontSize(11);
      doc.text(`Department ID: ${deptId}   Department: ${dept.name}`, 14, y);
      y += 6;

      const tableData = dept.rows.map((r) => {
        const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
        const facultyName = assignedFaculty[facultyKey] || "Not Assigned";
        return [
          r.date,
          r.session,
          r.time,
          r.labName,
          r.subjectCode,
          r.subjectName,
          r.studentsAllocated,
          facultyName,
        ];
      });

      autoTable(doc, {
        head: [["Date","Session","Time","Lab Name","Subject Code","Subject Name","Students","Faculty"]],
        body: tableData,
        startY: y,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 3: { cellWidth: "auto" }, 5: { cellWidth: "auto" } },
      });

      y = (doc as any).lastAutoTable.finalY + 15;
      if (y > 250) { doc.addPage(); y = 20; }
    }

    const date = new Date().toLocaleDateString();
    doc.setFontSize(9);
    doc.text(`Generated on ${date}`, 14, doc.internal.pageSize.height - 10);

    doc.save("Internal_Examiner_Allotted_Report.pdf");
  };

  /* PDF Export for all saved allocations - Each allocation on separate page */
  const exportAllPDF = async () => {
    if (!savedAllocations.length) return;

    const doc = new jsPDF();

    // Process each saved allocation on a separate page
    for (let i = 0; i < savedAllocations.length; i++) {
      const allocation = savedAllocations[i];
      
      // Add new page for each department (except the first one)
      if (i > 0) {
        doc.addPage();
      }

      // Load logo for each page with bigger size
      const logoUrl = "/Anna University logo.png";
      const logoImg = new Image();
      logoImg.src = logoUrl;

      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => {
          // Increased logo size from 35x35 to 45x45
          doc.addImage(logoImg, "PNG", 14, 10, 45, 45);
          resolve();
        };
        logoImg.onerror = () => reject(new Error("Failed to load logo image"));
      });

      // Header text for each department page
      doc.setFontSize(14);
      doc.text("ANNA UNIVERSITY :: CHENNAI - 600 025", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", 105, 28, { align: "center" });

      doc.setFontSize(13);
      doc.text("(APR/MAY) / (NOV/DEC) EXAMINATIONS", 105, 36, { align: "center" });

      doc.setFontSize(13);
      doc.text("Internal Examiner Allotted Report", 105, 44, { align: "center" });

      // Department-specific header
      doc.setFontSize(12);
      doc.text(`Department: ${allocation.department_name}`, 105, 57, { align: "center" });
      doc.setFontSize(11);
      doc.text(`Department ID: ${allocation.department_id}`, 105, 65, { align: "center" });

      let y = 75; // Starting Y position for table

      // Create table data for this department
      const tableData = allocation.rows.map((r) => {
        const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
        const facultyName = allocation.assignedFaculty[facultyKey] || "Not Assigned";
        return [
          r.date,
          r.session,
          r.time,
          r.labName,
          r.subjectCode,
          r.subjectName,
          r.studentsAllocated,
          facultyName,
        ];
      });

      // Add table for this department
      autoTable(doc, {
        head: [["Date","Session","Time","Lab Name","Subject Code","Subject Name","Students","Faculty"]],
        body: tableData,
        startY: y,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 3: { cellWidth: "auto" }, 5: { cellWidth: "auto" } },
      });

      // Add footer for this page
      const date = new Date().toLocaleDateString();
      doc.setFontSize(9);
      doc.text(`Generated on ${date} | Page ${i + 1} of ${savedAllocations.length}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save("All_Departments_Allocation_Report.pdf");
  };

  // Group rows for single allocation view
  const grouped = rows.reduce((acc, row) => {
    const dept = row.department_id || "NA";
    if (!acc[dept]) acc[dept] = { name: row.department_name || "", rows: [] };
    acc[dept].rows.push(row);
    return acc;
  }, {} as Record<string, { name: string; rows: Row[] }>);

  // If this is a multi-export, show the multi-export interface
  if (isMultiExport) {
    return (
      <main className="py-6 flex justify-center">
        <section className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Export All Saved Allocations</h1>
            <p className="text-gray-600">Download all {savedAllocations.length} saved department allocations in one file</p>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Total Departments:</span>
                  <p className="font-medium">{savedAllocations.length}</p>
                </div>
                <div>
                  <span className="text-blue-600">Total Allocations:</span>
                  <p className="font-medium">{savedAllocations.reduce((sum, a) => sum + a.rows.length, 0)}</p>
                </div>
                <div>
                  <span className="text-blue-600">Date Range:</span>
                  <p className="font-medium">{new Date(Math.min(...savedAllocations.map(a => new Date(a.createdAt).getTime()))).toLocaleDateString()} - {new Date(Math.max(...savedAllocations.map(a => new Date(a.createdAt).getTime()))).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-blue-600">File Size:</span>
                  <p className="font-medium">~{Math.ceil(savedAllocations.reduce((sum, a) => sum + a.rows.length, 0) * 0.1)} KB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:opacity-90 text-lg px-8 py-3"
              onClick={exportAllExcel}
              disabled={!savedAllocations.length}
            >
              �� Download All Excel
            </Button>
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:opacity-90 text-lg px-8 py-3"
              onClick={exportAllPDF}
              disabled={!savedAllocations.length}
            >
              �� Download All PDF (Separate Pages)
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Department List:</h3>
            {savedAllocations.map((allocation, index) => (
              <div key={allocation.department_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <span className="ml-2 font-medium">{allocation.department_name}</span>
                    <span className="ml-2 text-sm text-gray-500">({allocation.department_id})</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {allocation.rows.length} allocations • {new Date(allocation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // Single allocation export interface (existing functionality)
  return (
    <main className="py-6">
      <section className="card-enhanced">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl text-gradient">Export Allocations</h1>
          <span className="text-xs text-muted-foreground">CSV / PDF Export</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="btn-gradient" onClick={exportCSV} disabled={!rows.length}>Download CSV</Button>
          <Button className="btn-glass" onClick={exportPDF} disabled={!rows.length}>Download PDF</Button>
        </div>
      </section>
    </main>
  );
}
