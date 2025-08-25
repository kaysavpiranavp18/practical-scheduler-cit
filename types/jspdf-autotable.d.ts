/* eslint-disable @typescript-eslint/no-explicit-any */
import { jsPDF } from "jspdf";

declare module "jspdf-autotable" {
  interface UserOptions {
    head?: any[];
    body?: any[];
    startY?: number;
    theme?: "striped" | "grid" | "plain";
    headStyles?: Record<string, any>;
    styles?: Record<string, any>;
    columnStyles?: Record<string, any>;
  }

  function autoTable(doc: jsPDF, options: UserOptions): jsPDF;

  export default autoTable;
}
