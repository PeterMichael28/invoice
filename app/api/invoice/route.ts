import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { requireUser } from '@/hooks/useRequireUser';

export async function GET() {
 try {
  const session = await requireUser();
  const invoices = await prisma.invoice.findMany({
   where: {
    userId: session.user?.id,
   },
   select: {
    id: true,
    clientName: true,
    total: true,
    createdAt: true,
    status: true,
    invoiceNumber: true,
    currency: true,
   },
   orderBy: {
    createdAt: 'desc',
   },
  });

  const formattedInvoices = invoices.map((invoice) => ({
   ...invoice,
   createdAt: invoice.createdAt.toISOString(),
  }));

  return NextResponse.json(formattedInvoices);
 } catch (error) {
  console.error('Error fetching invoices:', error);
  return NextResponse.json(
   { error: 'Error fetching invoices' },
   { status: 500 },
  );
 }
}
