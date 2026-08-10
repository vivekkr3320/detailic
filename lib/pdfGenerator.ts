import { jsPDF } from "jspdf";
import { formatAadhaar } from "./utils";

export interface PDFWorkerData {
  id?: string;
  registration_id: string;
  registration_date: string;
  full_name: string;
  father_name: string;
  mobile_number: string;
  address: string;
  aadhaar_number: string;
  pan_number: string;
  photo_data_url?: string | null;
  photo_url?: string | null;
  status?: string;
  updated_at?: string;
}

const CONTRACTOR_NAME = "DETAILIC CONTRACTOR SERVICES";

/**
 * Convert an image URL to a Base64 data URL
 */
export async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Generate a single Worker Registration A4 PDF document
 */
export function buildSingleWorkerPdfDoc(worker: PDFWorkerData, photoDataUrl?: string | null): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  // --- Accent Header Bar ---
  doc.setFillColor(29, 78, 216); // #1d4ed8 blue
  doc.rect(0, 0, pageWidth, 8, "F");

  // --- Title & Company Header ---
  let y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(CONTRACTOR_NAME.toUpperCase(), margin, y);

  y += 6;
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("WORKER REGISTRATION RECORD", margin, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Official Worker Identity & Registration Form", margin, y);

  // --- Photo Box (Top Right) ---
  const photoX = 155;
  const photoY = 14;
  const photoWidth = 40;
  const photoHeight = 48;

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(photoX, photoY, photoWidth, photoHeight, "FD");

  const imageSrc = photoDataUrl || worker.photo_data_url || worker.photo_url;
  let photoDrawn = false;

  if (imageSrc) {
    try {
      doc.addImage(imageSrc, "JPEG", photoX + 1, photoY + 1, photoWidth - 2, photoHeight - 2);
      photoDrawn = true;
    } catch {
      // Image add failed, fallback to placeholder text
    }
  }

  if (!photoDrawn) {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("WORKER PHOTO", photoX + photoWidth / 2, photoY + photoHeight / 2, {
      align: "center",
    });
  }

  // --- Registration Meta Card ---
  y += 8;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, 135, 22, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("Registration ID:", margin + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216); // blue-700
  doc.setFontSize(11);
  doc.text(worker.registration_id || "WR-2026-000001", margin + 34, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Registration Date: ${worker.registration_date || new Date().toLocaleDateString("en-IN")}`, margin + 4, y + 13);
  doc.text(`Status: ${worker.status?.toUpperCase() || "REGISTERED"}`, margin + 75, y + 13);

  y += 28;

  // Helper for Section Headers
  const renderSectionHeader = (title: string, currentY: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, "F");
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), margin + 3, currentY + 5);

    return currentY + 11;
  };

  // --- SECTION 1: WORKER DETAILS ---
  y = renderSectionHeader("1. Worker Details", y);

  const drawFieldRow = (label: string, value: string, currentY: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(label, margin + 2, currentY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42); // slate-900

    // Handle multiline address wrapping
    const labelOffset = 38;
    const availableWidth = contentWidth - labelOffset - 4;
    const splitLines = doc.splitTextToSize(value || "N/A", availableWidth);
    doc.text(splitLines, margin + labelOffset, currentY);

    const rowHeight = Math.max(6, splitLines.length * 5);
    return currentY + rowHeight + 1;
  };

  y = drawFieldRow("Full Name:", worker.full_name, y);
  y = drawFieldRow("Father's Name:", worker.father_name, y);
  y = drawFieldRow("Mobile Number:", worker.mobile_number, y);
  y = drawFieldRow("Full Address:", worker.address, y);

  y += 4;

  // --- SECTION 2: IDENTIFICATION DETAILS ---
  y = renderSectionHeader("2. Identification Details", y);

  const formattedAadhaar = worker.aadhaar_number ? formatAadhaar(worker.aadhaar_number) : "N/A";
  y = drawFieldRow("Aadhaar Number:", formattedAadhaar, y);
  y = drawFieldRow("PAN Number:", worker.pan_number ? worker.pan_number.toUpperCase() : "N/A", y);

  y += 4;

  // --- SECTION 3: REGISTRATION INFORMATION ---
  y = renderSectionHeader("3. Registration Summary", y);
  y = drawFieldRow("System ID:", worker.id || worker.registration_id, y);
  y = drawFieldRow("Registration Date:", worker.registration_date || new Date().toLocaleDateString("en-IN"), y);
  y = drawFieldRow("Record Status:", worker.status ? worker.status.toUpperCase() : "ACTIVE", y);

  y += 6;

  // --- DECLARATION & SIGNATURES ---
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const declarationText = "Declaration: I confirm that the information provided during worker registration is true, accurate, and complete to the best of my knowledge. This record serves as official worker details under the contractor.";
  const decLines = doc.splitTextToSize(declarationText, contentWidth - 8);
  doc.text(decLines, margin + 4, y + 5);

  y += 32;

  // --- Signature Lines ---
  const leftSigX = margin + 10;
  const rightSigX = margin + 110;

  doc.setDrawColor(100, 116, 139);
  doc.line(leftSigX, y, leftSigX + 50, y);
  doc.line(rightSigX, y, rightSigX + 50, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("Worker Signature", leftSigX + 8, y);
  doc.text("Contractor Signature", rightSigX + 6, y);

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Date: ____________", leftSigX + 11, y);
  doc.text("(Authorized Stamp)", rightSigX + 8, y);

  // --- Page Footer ---
  const footerY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 3, margin + contentWidth, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Detailic Worker Registration System • Confidential Record", margin, footerY);
  doc.text("Page 1 of 1", margin + contentWidth, footerY, { align: "right" });

  return doc;
}

/**
 * Generate a paginated multi-worker PDF report for Admin
 */
export function buildMultiWorkerPdfDoc(workers: PDFWorkerData[]): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const totalPages = workers.length;

  workers.forEach((worker, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const singleDoc = buildSingleWorkerPdfDoc(worker);
    // Copy content or build page
    // Since buildSingleWorkerPdfDoc returns a single-page jsPDF, let's call the single builder directly on current page:
    buildSingleWorkerPage(doc, worker, index + 1, totalPages);
  });

  return doc;
}

function buildSingleWorkerPage(doc: jsPDF, worker: PDFWorkerData, currentPage: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Top Accent
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, pageWidth, 8, "F");

  // Header
  let y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(CONTRACTOR_NAME.toUpperCase(), margin, y);

  y += 6;
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("WORKER REGISTRATION RECORD", margin, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Official Worker Identity & Registration Form", margin, y);

  // Photo Box
  const photoX = 155;
  const photoY = 14;
  const photoWidth = 40;
  const photoHeight = 48;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(photoX, photoY, photoWidth, photoHeight, "FD");

  const imageSrc = worker.photo_data_url || worker.photo_url;
  let photoDrawn = false;
  if (imageSrc) {
    try {
      doc.addImage(imageSrc, "JPEG", photoX + 1, photoY + 1, photoWidth - 2, photoHeight - 2);
      photoDrawn = true;
    } catch {
      // fallback
    }
  }

  if (!photoDrawn) {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("WORKER PHOTO", photoX + photoWidth / 2, photoY + photoHeight / 2, { align: "center" });
  }

  // Meta Card
  y += 8;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, 135, 22, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Registration ID:", margin + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216);
  doc.setFontSize(11);
  doc.text(worker.registration_id || "WR-2026-000001", margin + 34, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Registration Date: ${worker.registration_date || new Date().toLocaleDateString("en-IN")}`, margin + 4, y + 13);
  doc.text(`Status: ${worker.status?.toUpperCase() || "REGISTERED"}`, margin + 75, y + 13);

  y += 28;

  const renderSectionHeader = (title: string, currentY: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, "F");
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), margin + 3, currentY + 5);

    return currentY + 11;
  };

  // Section 1
  y = renderSectionHeader("1. Worker Details", y);

  const drawFieldRow = (label: string, value: string, currentY: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 2, currentY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    const labelOffset = 38;
    const availableWidth = contentWidth - labelOffset - 4;
    const splitLines = doc.splitTextToSize(value || "N/A", availableWidth);
    doc.text(splitLines, margin + labelOffset, currentY);

    const rowHeight = Math.max(6, splitLines.length * 5);
    return currentY + rowHeight + 1;
  };

  y = drawFieldRow("Full Name:", worker.full_name, y);
  y = drawFieldRow("Father's Name:", worker.father_name, y);
  y = drawFieldRow("Mobile Number:", worker.mobile_number, y);
  y = drawFieldRow("Full Address:", worker.address, y);

  y += 4;

  // Section 2
  y = renderSectionHeader("2. Identification Details", y);
  const formattedAadhaar = worker.aadhaar_number ? formatAadhaar(worker.aadhaar_number) : "N/A";
  y = drawFieldRow("Aadhaar Number:", formattedAadhaar, y);
  y = drawFieldRow("PAN Number:", worker.pan_number ? worker.pan_number.toUpperCase() : "N/A", y);

  y += 4;

  // Section 3
  y = renderSectionHeader("3. Registration Summary", y);
  y = drawFieldRow("System ID:", worker.id || worker.registration_id, y);
  y = drawFieldRow("Registration Date:", worker.registration_date || new Date().toLocaleDateString("en-IN"), y);
  y = drawFieldRow("Record Status:", worker.status ? worker.status.toUpperCase() : "ACTIVE", y);

  y += 6;

  // Declaration & Signatures
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const declarationText = "Declaration: I confirm that the information provided during worker registration is true, accurate, and complete to the best of my knowledge. This record serves as official worker details under the contractor.";
  const decLines = doc.splitTextToSize(declarationText, contentWidth - 8);
  doc.text(decLines, margin + 4, y + 5);

  y += 32;

  const leftSigX = margin + 10;
  const rightSigX = margin + 110;

  doc.setDrawColor(100, 116, 139);
  doc.line(leftSigX, y, leftSigX + 50, y);
  doc.line(rightSigX, y, rightSigX + 50, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("Worker Signature", leftSigX + 8, y);
  doc.text("Contractor Signature", rightSigX + 6, y);

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Date: ____________", leftSigX + 11, y);
  doc.text("(Authorized Stamp)", rightSigX + 8, y);

  // Footer
  const footerY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 3, margin + contentWidth, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Detailic Worker Registration System • Confidential Record", margin, footerY);
  doc.text(`Page ${currentPage} of ${totalPages}`, margin + contentWidth, footerY, { align: "right" });
}

/**
 * Trigger client-side PDF download
 */
export function downloadWorkerPdf(worker: PDFWorkerData, photoDataUrl?: string | null) {
  const doc = buildSingleWorkerPdfDoc(worker, photoDataUrl);
  const cleanId = worker.registration_id || "WR-REGISTRATION";
  const filename = `Worker_Registration_${cleanId}.pdf`;
  doc.save(filename);
}

/**
 * Open PDF preview in a new browser window/tab
 */
export function previewWorkerPdf(worker: PDFWorkerData, photoDataUrl?: string | null) {
  const doc = buildSingleWorkerPdfDoc(worker, photoDataUrl);
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, "_blank");
}
