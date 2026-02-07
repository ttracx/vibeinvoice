"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FileText, DollarSign, Clock, AlertCircle } from "lucide-react";

interface StatsItem {
  status: string;
  _count: number;
  _sum: { total: number | null };
}

interface DashboardStatsProps {
  stats: StatsItem[];
  totalInvoices: number;
}

export function DashboardStats({ stats, totalInvoices }: DashboardStatsProps) {
  const getStatByStatus = (status: string) => {
    return stats.find((s) => s.status === status);
  };

  const paidStats = getStatByStatus("PAID");
  const pendingStats = stats.filter((s) => ["SENT", "VIEWED", "DRAFT"].includes(s.status));
  const overdueStats = getStatByStatus("OVERDUE");

  const totalPaid = paidStats?._sum?.total || 0;
  const totalPending = pendingStats.reduce((acc, s) => acc + (s._sum?.total || 0), 0);
  const totalOverdue = overdueStats?._sum?.total || 0;

  const statCards = [
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      description: "All time",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Paid",
      value: formatCurrency(totalPaid),
      description: `${paidStats?._count || 0} invoices`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending",
      value: formatCurrency(totalPending),
      description: `${pendingStats.reduce((acc, s) => acc + s._count, 0)} invoices`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Overdue",
      value: formatCurrency(totalOverdue),
      description: `${overdueStats?._count || 0} invoices`,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
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
  );
}
