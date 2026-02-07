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

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json(
      { error: 'Failed to get client' },
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

    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, phone, address, company, notes } = body;

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address,
        company,
        notes,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
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

    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { clientId: params.id },
    });

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing invoices' },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
