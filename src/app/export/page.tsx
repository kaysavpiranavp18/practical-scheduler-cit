"use client";
import { useEffect, useState, useMemo } from "react";
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
  const params = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [assignedFaculty, setAssignedFaculty] = useState<AssignedFacultyMap>({});
  const [savedAllocations, setSavedAllocations] = useState<SavedAllocation[]>([]);
  const [isMultiExport, setIsMultiExport] = useState(false);

  useEffect(() => {
    try {
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

  const exportAllExcel = () => {
    if (!savedAllocations.length) return;

    const workbook = XLSX.utils.book_new();

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

    XLSX.writeFile(workbook, "All_Departments_Allocation_Report.xlsx");
  };

  const exportPDF = async () => {
    const doc = new jsPDF();

    const logoUrl = "/Anna University logo.png";
    const logoImg = new Image();
    logoImg.src = logoUrl;

    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        doc.addImage(logoImg, "PNG", 14, 10, 35, 35);
        resolve();
      };
      logoImg.onerror = () => reject(new Error("Failed to load logo image"));
    });

    doc.setFontSize(14);
    doc.text("ANNA UNIVERSITY :: CHENNAI - 600 025", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", 105, 32, { align: "center" });
    doc.setFontSize(13);
    doc.text("Internal Examiner Allotted Report", 105, 47, { align: "center" });

    let y = 57; // Corrected to use 'let' for reassignment

    const grouped = rows.reduce((acc, row) => {
      const dept = row.department_id || "NA";
      if (!acc[dept]) acc[dept] = { name: row.department_name || "", rows: [] };
      acc[dept].rows.push(row);
      return acc;
    }, {} as Record<string, { name: string; rows: Row[] }>);

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

      y = (doc as any).lastAutoTable.finalY + 15; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (y > 250) { doc.addPage(); y = 20; }
    }

    const date = new Date().toLocaleDateString();
    doc.setFontSize(9);
    doc.text(`Generated on ${date}`, 14, doc.internal.pageSize.height - 10);

    doc.save("Internal_Examiner_Allotted_Report.pdf");
  };

  const exportAllPDF = async () => {
    if (!savedAllocations.length) return;

    const doc = new jsPDF();

    for (let i = 0; i < savedAllocations.length; i++) {
      const allocation = savedAllocations[i];
      
      if (i > 0) {
        doc.addPage();
      }

      const logoUrl = "/Anna University logo.png";
      const logoImg = new Image();
      logoImg.src = logoUrl;

      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => {
          doc.addImage(logoImg, "PNG", 14, 10, 45, 45);
          resolve();
        };
        logoImg.onerror = () => reject(new Error("Failed to load logo image"));
      });

      doc.setFontSize(14);
      doc.text("ANNA UNIVERSITY :: CHENNAI - 600 025", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", 105, 28, { align: "center" });

      doc.setFontSize(13);
      doc.text("(APR/MAY) / (NOV/DEC) EXAMINATIONS", 105, 36, { align: "center" });

      doc.setFontSize(13);
      doc.text("Internal Examiner Allotted Report", 105, 44, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Department: ${allocation.department_name}`, 105, 57, { align: "center" });
      doc.setFontSize(11);
      doc.text(`Department ID: ${allocation.department_id}`, 105, 65, { align: "center" });

      let y = 75;

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

      autoTable(doc, {
        head: [["Date","Session","Time","Lab Name","Subject Code","Subject Name","Students","Faculty"]],
        body: tableData,
        startY: y,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 3: { cellWidth: "auto" }, 5: { cellWidth: "auto" } },
      });

      const date = new Date().toLocaleDateString();
      doc.setFontSize(9);
      doc.text(`Generated on ${date} | Page ${i + 1} of ${savedAllocations.length}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save("All_Departments_Allocation_Report.pdf");
  };

  const grouped = rows.reduce((acc, row) => {
    const dept = row.department_id || "NA";
    if (!acc[dept]) acc[dept] = { name: row.department_name || "", rows: [] };
    acc[dept].rows.push(row);
    return acc;
  }, {} as Record<string, { name: string; rows: Row[] }>);

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
              Download All Excel
            </Button>
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:opacity-90 text-lg px-8 py-3"
              onClick={exportAllPDF}
              disabled={!savedAllocations.length}
            >
              Download All PDF
            </Button>
          </div>
        </section>
      </main>
    );
  }

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

