import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to get invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    } = body;

    // Check invoice limit for free users
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const invoicesThisMonth = await prisma.invoice.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: thisMonth },
      },
    });

    const isPro = !!session.user.stripePriceId;
    const invoiceLimit = isPro ? Infinity : 5;

    if (invoicesThisMonth >= invoiceLimit) {
      return NextResponse.json(
        { error: 'Invoice limit reached. Upgrade to Pro for unlimited invoices.' },
        { status: 403 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        discount: discount || 0,
        subtotal: subtotal || 0,
        total: total || 0,
        notes,
        terms,
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, client: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
