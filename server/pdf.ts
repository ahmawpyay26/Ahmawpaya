import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun } from "docx";

export async function generateInvoicePDF(invoice: any) {
  const items = invoice.items || [];
  const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("ပစ္စည်း | Item")] }),
        new TableCell({ children: [new Paragraph("အရေအတွက် | Qty")] }),
        new TableCell({ children: [new Paragraph("စျေး | Price")] }),
        new TableCell({ children: [new Paragraph("စုစုပေါင်း | Amount")] }),
      ],
    }),
    ...items.map((item: any) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(item.productName || "")] }),
          new TableCell({ children: [new Paragraph(item.quantity?.toString() || "0")] }),
          new TableCell({ children: [new Paragraph(item.unitPrice?.toString() || "0")] }),
          new TableCell({ children: [new Paragraph(item.amount?.toString() || "0")] }),
        ],
      })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "ပြေစာ | INVOICE", bold: true, size: 56 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph(""),
          new Paragraph(`Invoice #: ${invoice.invoiceNumber || "N/A"}`),
          new Paragraph(`Date: ${invoice.invoiceDate || new Date().toLocaleDateString()}`),
          new Paragraph(`Customer: ${invoice.customerName || "N/A"}`),
          new Paragraph(""),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
          new Paragraph(""),
          new Paragraph({
            children: [new TextRun({ text: `Total: ${totalAmount} MMK`, bold: true, size: 48 })],
          }),
          new Paragraph(""),
          new Paragraph(`Staff: ${invoice.staffName || "N/A"}`),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
