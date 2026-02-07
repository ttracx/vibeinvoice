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

    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: 'Failed to get clients' },
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
    const { name, email, phone, address, company, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
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
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
