"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Download, Edit, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  company: string | null;
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
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  client: Client;
  items: InvoiceItem[];
}

interface BusinessInfo {
  businessName: string | null;
  businessAddress: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessLogo: string | null;
}

interface InvoiceDetailProps {
  invoice: Invoice;
  businessInfo: BusinessInfo | null;
}

export function InvoiceDetail({ invoice, businessInfo }: InvoiceDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(invoice.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setStatus(newStatus);
      toast({
        title: "Status updated",
        description: `Invoice status changed to ${newStatus}`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">Invoice for {invoice.client.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger className="w-[140px]">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="VIEWED">Viewed</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/invoices/${invoice.id}/pdf`} download>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">INVOICE</h2>
              <Badge className={getStatusColor(status)}>{status}</Badge>
            </div>
            <div className="text-right">
              {businessInfo?.businessName ? (
                <div className="space-y-1">
                  <p className="font-bold text-lg">{businessInfo.businessName}</p>
                  {businessInfo.businessAddress && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {businessInfo.businessAddress}
                    </p>
                  )}
                  {businessInfo.businessEmail && (
                    <p className="text-sm text-muted-foreground">
                      {businessInfo.businessEmail}
                    </p>
                  )}
                  {businessInfo.businessPhone && (
                    <p className="text-sm text-muted-foreground">
                      {businessInfo.businessPhone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add business info in settings
                </p>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                BILL TO
              </h3>
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-sm text-muted-foreground">
                  {invoice.client.company}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
              {invoice.client.phone && (
                <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>
              )}
              {invoice.client.address && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoice.client.address}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div>
                  <span className="text-sm text-muted-foreground">Invoice Number: </span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Issue Date: </span>
                  <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Due Date: </span>
                  <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 space-y-4">
              <Separator />
              {invoice.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Notes
                  </h3>
                  <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Terms & Conditions
                  </h3>
                  <p className="text-sm whitespace-pre-line">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
