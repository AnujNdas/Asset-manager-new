import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
console.log(jsPDF)
export const exportAuditPDF = ({
  title,
  columns,
  data,
  filters = {}
}) => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.text(title, 14, 18);

  doc.setFontSize(10);

  let y = 28;

  Object.entries(filters).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 14, y);
    y += 6;
  });

  autoTable(doc, {
    startY: y + 4,
    head: [columns],
    body: data,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: "middle"
    },
    headStyles: {
      fillColor: [33, 150, 243]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`${title}.pdf`);
};