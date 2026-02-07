import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status } = body as { status: string };

    const validStatuses = ['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status: status as InvoiceStatus };

    if (status === 'PAID') {
      updateData.paidAt = new Date();
    } else if (existingInvoice.paidAt) {
      updateData.paidAt = null;
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Update invoice status error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}
