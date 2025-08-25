"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
  branch_code?: string;
  branch_name?: string;
  semester?: string;
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

  const exportAllPDF = async () => {
    if (!savedAllocations.length) return;

    const doc = new jsPDF();

    for (let i = 0; i < savedAllocations.length; i++) {
      const allocation = savedAllocations[i];

      if (i > 0) doc.addPage();

      // Load and add logo
      const logoUrl = "/Anna University logo.png";
      const logoImg = new Image();
      logoImg.src = logoUrl;
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          doc.addImage(logoImg, "PNG", 14, 10, 20, 20);
          resolve();
        };
        logoImg.onerror = () => resolve();
      });

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("ANNA UNIVERSITY :: CHENNAI - 600 025", 105, 15, { align: "center" });
      doc.setFontSize(11);
      doc.text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", 105, 21, { align: "center" });
      doc.setFontSize(10);
      doc.text("APRIL / MAY EXAMINATIONS, 2025 EXAMINATIONS", 105, 27, { align: "center" });
      doc.setFontSize(11);
      doc.text("Internal Examiner Allotted Report", 105, 33, { align: "center" });

      let y = 40;

      // Branch Code & Branch Name
      const branchCode = allocation.rows[0]?.branch_code || allocation.department_id;
      const branchName = allocation.rows[0]?.branch_name || allocation.department_name;
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Branch Code - Branch Name [ University ] : ${branchCode} - ${branchName} [ AUC ]`,
        14,
        y
      );
      doc.setTextColor(0, 0, 0);
      y += 6;

      // Table Data
      const tableData = allocation.rows.map((r) => {
        const facultyKey = `${r.subjectCode}|${r.date}|${r.labId || r.labName}`;
        const facultyName = allocation.assignedFaculty[facultyKey] || "Not Assigned";
        return [
          r.semester || "",
          r.subjectCode,
          r.subjectName,
          r.studentsAllocated,
          r.session,
          r.date,
          r.time,
          facultyName
        ];
      });

      // AutoTable
      autoTable(doc, {
        head: [
          [
            "Semester",
            "Subject Code",
            "Subject Name",
            "Total Students",
            "Session No.",
            "Date",
            "Time",
            "Internal Examiner Staff Name"
          ]
        ],
        body: tableData,
        startY: y,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, halign: "center", valign: "middle" },
        headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.3 },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.3
      });

      const date = new Date().toLocaleDateString();
      doc.setFontSize(8);
      doc.text(`Generated on ${date}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save("All_Departments_Allocation_Report.pdf");
  };

  if (isMultiExport) {
    return (
      <main className="py-6 flex justify-center">
        <section className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Export All Saved Allocations</h1>
            <p className="text-gray-600">
              Download all {savedAllocations.length} saved department allocations in one file
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
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
          <span className="text-xs text-muted-foreground">PDF Export</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="btn-glass" onClick={exportAllPDF} disabled={!rows.length}>
            Download PDF
          </Button>
        </div>
      </section>
    </main>
  );
}
