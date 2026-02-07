import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get this month's start
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  // Get last month's start
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Fetch various stats
  const [
    totalInvoices,
    thisMonthInvoices,
    lastMonthInvoices,
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    totalClients,
    overdueInvoices,
    recentInvoices,
    topClients,
  ] = await Promise.all([
    prisma.invoice.count({ where: { userId: session.user.id } }),
    prisma.invoice.count({
      where: { userId: session.user.id, createdAt: { gte: thisMonth } },
    }),
    prisma.invoice.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: lastMonth, lt: thisMonth },
      },
    }),
    prisma.invoice.aggregate({
      where: { userId: session.user.id, status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId: session.user.id,
        status: "PAID",
        paidAt: { gte: thisMonth },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId: session.user.id,
        status: "PAID",
        paidAt: { gte: lastMonth, lt: thisMonth },
      },
      _sum: { total: true },
    }),
    prisma.client.count({ where: { userId: session.user.id } }),
    prisma.invoice.count({
      where: { userId: session.user.id, status: "OVERDUE" },
    }),
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: true },
    }),
    prisma.client.findMany({
      where: { userId: session.user.id },
      include: {
        invoices: {
          where: { status: "PAID" },
          select: { total: true },
        },
      },
      orderBy: {
        invoices: { _count: "desc" },
      },
      take: 5,
    }),
  ]);

  const thisMonthRevenueValue = thisMonthRevenue._sum.total || 0;
  const lastMonthRevenueValue = lastMonthRevenue._sum.total || 0;
  const revenueChange =
    lastMonthRevenueValue > 0
      ? ((thisMonthRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100
      : 0;

  const invoiceChange =
    lastMonthInvoices > 0
      ? ((thisMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100
      : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue._sum.total || 0),
      description: "All time paid invoices",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "This Month",
      value: formatCurrency(thisMonthRevenueValue),
      description:
        revenueChange > 0
          ? `+${revenueChange.toFixed(1)}% from last month`
          : revenueChange < 0
          ? `${revenueChange.toFixed(1)}% from last month`
          : "Same as last month",
      icon: revenueChange >= 0 ? TrendingUp : TrendingDown,
      color: revenueChange >= 0 ? "text-green-600" : "text-red-600",
      bgColor: revenueChange >= 0 ? "bg-green-100" : "bg-red-100",
    },
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      description: `${thisMonthInvoices} this month`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Clients",
      value: totalClients.toString(),
      description: "Active clients",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Overdue",
      value: overdueInvoices.toString(),
      description: "Need attention",
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const topClientsWithRevenue = topClients.map((client) => ({
    ...client,
    totalRevenue: client.invoices.reduce((sum, inv) => sum + inv.total, 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your invoicing performance and revenue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.length === 0 ? (
                <p className="text-muted-foreground text-sm">No invoices yet</p>
              ) : (
                recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(invoice.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientsWithRevenue.length === 0 ? (
                <p className="text-muted-foreground text-sm">No clients yet</p>
              ) : (
                topClientsWithRevenue.map((client, index) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.invoices.length} invoice
                          {client.invoices.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(client.totalRevenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
