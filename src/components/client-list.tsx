"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Eye, Edit, Trash2, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ClientWithStats {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  totalBilled: number;
  totalPaid: number;
  invoiceCount: number;
}

interface ClientListProps {
  clients: ClientWithStats[];
}

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: "Client deleted",
        description: "The client has been removed.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first client to start creating invoices
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-center">Invoices</TableHead>
            <TableHead className="text-right">Total Billed</TableHead>
            <TableHead className="text-right">Total Paid</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.company || "-"}</TableCell>
              <TableCell className="text-center">{client.invoiceCount}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(client.totalBilled)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(client.totalPaid)}
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
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Invoice
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(client.id)}
                      className="text-destructive"
                    >
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
