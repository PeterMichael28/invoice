import { requireUser } from '@/hooks/useRequireUser';
import { formatCurrency } from '@/utils/formatCurrency';
import { emailClient } from '@/utils/mailtrap';
import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
const url = process.env.PRODUCTION_URL!;

export async function POST(
 request: Request,
 {
  params,
 }: {
  params: Promise<{ invoiceId: string }>;
 },
) {
 try {
  const session = await requireUser();

  const { invoiceId } = await params;

  const invoiceData = await prisma.invoice.findUnique({
   where: {
    id: invoiceId,
    userId: session.user?.id,
   },
  });

  if (!invoiceData) {
   return NextResponse.json(
    { error: 'Invoice not found' },
    { status: 404 },
   );
  }

  const sender = {
   email: 'hello@demomailtrap.com',
   name: 'Sarah Wilsons',
  };

  emailClient.send({
   from: sender,
   to: [{ email: 'sarahwilsons001@gmail.com' }],
   template_uuid: '92319c5c-013d-4a05-ba50-a62824e6eb24',
   template_variables: {
    clientName: invoiceData.clientName,
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceDueDate: new Intl.DateTimeFormat('en-US', {
     dateStyle: 'long',
    }).format(new Date(invoiceData.date)),
    invoiceAmount: formatCurrency({
     amount: invoiceData.total,
     currency: invoiceData.currency as 'USD' | 'EUR' | 'NGN',
    }),
    invoiceLink:
     process.env.NODE_ENV !== 'production'
      ? `http://localhost:3000/api/invoice/${invoiceData.id}`
      : `${url}/api/invoice/${invoiceData.id}`,
    supportEmail: 'sarahwilsons001@gmail.com',
   },
  });

  return NextResponse.json({ success: true });
 } catch (error) {
  console.log('Error sending Email reminder', error);
  return NextResponse.json(
   { error: 'Failed to send Email reminder' },
   { status: 500 },
  );
 }
}
