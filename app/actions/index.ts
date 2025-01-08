'use server';

import { parseWithZod } from '@conform-to/zod';

import { redirect } from 'next/navigation';
import { requireUser } from '@/hooks/useRequireUser';
import { invoiceSchema, onboardingSchema } from '@/utils/formSchemas';
import { prisma } from '@/utils/prisma';
import { formatCurrency } from '@/utils/formatCurrency';
import { emailClient } from '@/utils/mailtrap';
import { revalidatePath } from 'next/cache';

const url = process.env.PRODUCTION_URL!;
export async function onboardUser(
 prevState: unknown,
 formData: FormData,
) {
 const session = await requireUser();

 const submission = parseWithZod(formData, {
  schema: onboardingSchema,
 });

 if (submission.status !== 'success') {
  return submission.reply();
 }

 const data = await prisma.user.update({
  where: {
   id: session.user?.id,
  },
  data: {
   firstName: submission.value.firstName,
   lastName: submission.value.lastName,
   address: submission.value.address,
  },
 });

 return redirect('/dashboard');
}

export async function createInvoice(
 prevState: unknown,
 formData: FormData,
) {
 const session = await requireUser();

 const submission = parseWithZod(formData, {
  schema: invoiceSchema,
 });

 if (submission.status !== 'success') {
  return submission.reply();
 }

 const data = await prisma.invoice.create({
  data: {
   clientAddress: submission.value.clientAddress,
   clientEmail: submission.value.clientEmail,
   clientName: submission.value.clientName,
   currency: submission.value.currency,
   date: submission.value.date,
   dueDate: submission.value.dueDate,
   fromAddress: submission.value.fromAddress,
   fromEmail: submission.value.fromEmail,
   fromName: submission.value.fromName,
   invoiceItemDescription: submission.value.invoiceItemDescription,
   invoiceItemQuantity: submission.value.invoiceItemQuantity,
   invoiceItemRate: submission.value.invoiceItemRate,
   invoiceName: submission.value.invoiceName,
   invoiceNumber: submission.value.invoiceNumber,
   status: submission.value.status,
   total: submission.value.total,
   note: submission.value.note,
   userId: session.user?.id,
  },
 });

 const sender = {
  email: 'hello@demomailtrap.com',
  name: 'Sarah Wilsons',
 };

 emailClient.send({
  from: sender,
  to: [{ email: 'sarahwilsons001@gmail.com' }],
  template_uuid: '82726efb-8109-44c4-a044-f7ae7536a7cc',
  template_variables: {
   clientName: submission.value.clientName,
   invoiceNumber: submission.value.invoiceNumber,
   invoiceDueDate: new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
   }).format(new Date(submission.value.date)),
   invoiceAmount: formatCurrency({
    amount: submission.value.total,
    currency: submission.value.currency as 'USD' | 'EUR' | 'NGN',
   }),
   invoiceLink:
    process.env.NODE_ENV !== 'production'
     ? `http://localhost:3000/api/invoice/${data.id}`
     : `${url}/api/invoice/${data.id}`,
  },
 });
 revalidatePath('/dashboard/invoices');
 return redirect('/dashboard/invoices');
}

export async function editInvoice(
 prevState: unknown,
 formData: FormData,
) {
 const session = await requireUser();

 const submission = parseWithZod(formData, {
  schema: invoiceSchema,
 });

 if (submission.status !== 'success') {
  return submission.reply();
 }

 const data = await prisma.invoice.update({
  where: {
   id: formData.get('id') as string,
   userId: session.user?.id,
  },
  data: {
   clientAddress: submission.value.clientAddress,
   clientEmail: submission.value.clientEmail,
   clientName: submission.value.clientName,
   currency: submission.value.currency,
   date: submission.value.date,
   dueDate: submission.value.dueDate,
   fromAddress: submission.value.fromAddress,
   fromEmail: submission.value.fromEmail,
   fromName: submission.value.fromName,
   invoiceItemDescription: submission.value.invoiceItemDescription,
   invoiceItemQuantity: submission.value.invoiceItemQuantity,
   invoiceItemRate: submission.value.invoiceItemRate,
   invoiceName: submission.value.invoiceName,
   invoiceNumber: submission.value.invoiceNumber,
   status: submission.value.status,
   total: submission.value.total,
   note: submission.value.note,
  },
 });

 const sender = {
  email: 'hello@demomailtrap.com',
  name: 'Sarah Wilsons',
 };

 emailClient.send({
  from: sender,
  to: [{ email: 'sarahwilsons001@gmail.com' }],
  template_uuid: '38e96b91-91f0-4fb4-9340-02be72c39d00',
  template_variables: {
   clientName: submission.value.clientName,
   invoiceNumber: submission.value.invoiceNumber,
   invoiceDueDate: new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
   }).format(new Date(submission.value.date)),
   invoiceAmount: formatCurrency({
    amount: submission.value.total,
    currency: submission.value.currency as 'USD' | 'EUR' | 'NGN',
   }),
   invoiceLink:
    process.env.NODE_ENV !== 'production'
     ? `http://localhost:3000/api/invoice/${data.id}`
     : `${url}/api/invoice/${data.id}`,
  },
 });
 //  revalidatePath('/dashboard/invoices');
 return redirect('/dashboard/invoices');
}

export async function DeleteInvoice(invoiceId: string) {
 const session = await requireUser();

 await prisma.invoice.delete({
  where: {
   userId: session.user?.id,
   id: invoiceId,
  },
 });
 revalidatePath('/dashboard/invoices');
 return redirect('/dashboard/invoices');
}

export async function MarkAsPaidAction(invoiceId: string) {
 const session = await requireUser();

 await prisma.invoice.update({
  where: {
   userId: session.user?.id,
   id: invoiceId,
  },
  data: {
   status: 'PAID',
  },
 });
 revalidatePath('/dashboard/invoices');
 return redirect('/dashboard/invoices');
}
