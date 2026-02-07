import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { InvoiceForm } from "@/components/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [invoice, clients, user] = await Promise.all([
    prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { items: true },
    }),
    prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessName: true,
        businessAddress: true,
        businessEmail: true,
        businessPhone: true,
      },
    }),
  ]);

  if (!invoice) {
    notFound();
  }

  const initialData = {
    id: invoice.id,
    clientId: invoice.clientId,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate.toISOString().split("T")[0],
    dueDate: invoice.dueDate.toISOString().split("T")[0],
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    taxRate: invoice.taxRate,
    discount: invoice.discount,
    notes: invoice.notes || "",
    terms: invoice.terms || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Invoice</h1>
        <p className="text-muted-foreground">
          Update invoice {invoice.invoiceNumber}
        </p>
      </div>

      <InvoiceForm clients={clients} businessInfo={user} initialData={initialData} />
    </div>
  );
}
