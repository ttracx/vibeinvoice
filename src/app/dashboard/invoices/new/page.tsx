import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InvoiceForm } from "@/components/invoice-form";

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      businessName: true,
      businessAddress: true,
      businessEmail: true,
      businessPhone: true,
    },
  });

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
    redirect("/pricing");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground">
          Create a new invoice for your client
        </p>
      </div>

      <InvoiceForm clients={clients} businessInfo={user} />
    </div>
  );
}
