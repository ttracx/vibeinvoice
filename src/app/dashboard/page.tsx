import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceList } from "@/components/invoice-list";
import { DashboardStats } from "@/components/dashboard-stats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const [invoices, stats] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: true,
      _sum: { total: true },
    }),
  ]);

  const totalInvoices = await prisma.invoice.count({
    where: { userId: session.user.id },
  });

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
  const canCreateInvoice = invoicesThisMonth < invoiceLimit;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <span className="text-sm text-muted-foreground">
              {invoicesThisMonth}/{invoiceLimit} invoices this month
            </span>
          )}
          {canCreateInvoice ? (
            <Button asChild>
              <Link href="/dashboard/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          )}
        </div>
      </div>

      <DashboardStats stats={stats} totalInvoices={totalInvoices} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Invoices</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/invoices">View All</Link>
          </Button>
        </div>
        <InvoiceList invoices={invoices} />
      </div>
    </div>
  );
}
