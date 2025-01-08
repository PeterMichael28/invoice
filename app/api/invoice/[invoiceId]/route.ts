import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { prisma } from '@/utils/prisma';
import { formatCurrency } from '@/utils/formatCurrency';

export async function GET(
 request: Request,
 {
  params,
 }: {
  params: Promise<{ invoiceId: string }>;
 },
) {
 const { invoiceId } = await params;

 const data = await prisma.invoice.findUnique({
  where: {
   id: invoiceId,
  },
  select: {
   invoiceName: true,
   invoiceNumber: true,
   currency: true,
   fromName: true,
   fromEmail: true,
   fromAddress: true,
   clientName: true,
   clientAddress: true,
   clientEmail: true,
   date: true,
   dueDate: true,
   invoiceItemDescription: true,
   invoiceItemQuantity: true,
   invoiceItemRate: true,
   total: true,
   note: true,
  },
 });

 if (!data) {
  return NextResponse.json(
   { error: 'Invoice not found' },
   { status: 404 },
  );
 }

 const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
 });

 // Color scheme
 const primaryColor = '#3498db';
 const secondaryColor = '#2c3e50';
 const lightGray = '#ecf0f1';

    
 const addColoredRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
 ) => {
  pdf.setFillColor(color);
  pdf.rect(x, y, w, h, 'F');
 };

 // Header
 addColoredRect(0, 0, 210, 30, primaryColor);
 pdf.setTextColor('#ffffff');
 pdf.setFontSize(28);
 pdf.setFont('helvetica', 'bold');
 pdf.text(data.invoiceName, 20, 25);

 // Invoice details
 pdf.setTextColor(secondaryColor);
 pdf.setFontSize(12);
 pdf.setFont('helvetica', 'normal');
 pdf.text(`Invoice #${data.invoiceNumber}`, 20, 50);
 pdf.text(
  `Date: ${new Intl.DateTimeFormat('en-NG', {
   dateStyle: 'long',
  }).format(data.date)}`,
  20,
  57,
 );
 pdf.text(`Due Date: Net ${data.dueDate}`, 20, 64);

 // From Section
 addColoredRect(20, 75, 80, 40, lightGray);
 pdf.setFontSize(14);
 pdf.setFont('helvetica', 'bold');
 pdf.text('From', 25, 85);
 pdf.setFontSize(10);
 pdf.setFont('helvetica', 'normal');
 pdf.text([data.fromName, data.fromEmail, data.fromAddress], 25, 92);

 // Client Section
 addColoredRect(110, 75, 80, 40, lightGray);
 pdf.setFontSize(14);
 pdf.setFont('helvetica', 'bold');
 pdf.text('Bill to', 115, 85);
 pdf.setFontSize(10);
 pdf.setFont('helvetica', 'normal');
 pdf.text(
  [data.clientName, data.clientEmail, data.clientAddress],
  115,
  92,
 );

 // Item table header
 addColoredRect(20, 125, 170, 10, primaryColor);
 pdf.setFontSize(11);
 pdf.setFont('helvetica', 'bold');
 pdf.setTextColor('#ffffff');
 pdf.text('Description', 25, 132);
 pdf.text('Quantity', 100, 132);
 pdf.text('Rate', 130, 132);
 pdf.text('Total', 160, 132);

 // Item Details
 pdf.setTextColor(secondaryColor);
 pdf.setFont('helvetica', 'normal');
 pdf.text(data.invoiceItemDescription, 25, 145);
 pdf.text(data.invoiceItemQuantity.toString(), 100, 145);
 pdf.text(
  formatCurrency({
   amount: data.invoiceItemRate,
   currency: data.currency as 'USD' | 'EUR' | 'NGN',
  }),
  130,
  145,
 );
 pdf.text(
  formatCurrency({
   amount: data.total,
   currency: data.currency as 'USD' | 'EUR' | 'NGN',
  }),
  160,
  145,
 );

 // Total Section
 addColoredRect(130, 155, 60, 10, lightGray);
 pdf.setFont('helvetica', 'bold');
 pdf.text(`Total (${data.currency})`, 135, 162);
 pdf.text(
  formatCurrency({
   amount: data.total,
   currency: data.currency as 'USD' | 'EUR' | 'NGN',
  }),
  160,
  162,
 );

 // Additional Note
 if (data.note) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Note:', 20, 180);
  pdf.text(data.note, 20, 187, { maxWidth: 170 });
 }

 // Footer
 pdf.setFont('helvetica', 'italic');
 pdf.setFontSize(8);
 pdf.setPage(1);
 pdf.text(
  `Page 1`,
  pdf.internal.pageSize.width - 30,
  pdf.internal.pageSize.height - 10,
 );

 // generate pdf as buffer
 const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

 // return pdf as download
 return new NextResponse(pdfBuffer, {
  headers: {
   'Content-Type': 'application/pdf',
   'Content-Disposition': 'inline',
  },
 });
}
