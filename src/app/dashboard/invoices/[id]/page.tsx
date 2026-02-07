import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceDetail } from "@/components/invoice-detail";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      client: true,
      items: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      businessName: true,
      businessAddress: true,
      businessEmail: true,
      businessPhone: true,
      businessLogo: true,
    },
  });

  return <InvoiceDetail invoice={invoice} businessInfo={user} />;
}
