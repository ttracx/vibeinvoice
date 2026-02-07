"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { MoreHorizontal, Eye, Edit, Download, Trash2, Send, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  total: number;
  client: Client;
  items: InvoiceItem[];
}

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first invoice to get started
          </p>
          <Button asChild>
            <Link href="/dashboard/invoices/new">Create Invoice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invoice.client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.client.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(invoice.issueDate)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/api/invoices/${invoice.id}/pdf`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {invoice.status === "DRAFT" && (
                      <DropdownMenuItem>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invoice
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
