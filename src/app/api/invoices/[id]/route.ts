import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { client: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      taxRate,
      taxAmount,
      discount,
      subtotal,
      total,
      notes,
      terms,
      status,
    } = body;

    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        clientId,
        invoiceNumber,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        taxRate: taxRate ?? undefined,
        taxAmount: taxAmount ?? undefined,
        discount: discount ?? undefined,
        subtotal: subtotal ?? undefined,
        total: total ?? undefined,
        notes,
        terms,
        status,
        items: items
          ? {
              create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
              })),
            }
          : undefined,
      },
      include: { items: true, client: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
