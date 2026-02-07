import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientList } from "@/components/client-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddClientDialog } from "@/components/add-client-dialog";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { invoices: true },
      },
      invoices: {
        select: { total: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const clientsWithStats = clients.map((client) => {
    const totalBilled = client.invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = client.invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      ...client,
      totalBilled,
      totalPaid,
      invoiceCount: client._count.invoices,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>
        <AddClientDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </AddClientDialog>
      </div>

      <ClientList clients={clientsWithStats} />
    </div>
  );
}
