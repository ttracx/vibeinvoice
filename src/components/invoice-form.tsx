"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, generateInvoiceNumber } from "@/lib/utils";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price must be 0 or greater"),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
  discount: z.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Client {
  id: string;
  name: string;
  email: string;
}

interface BusinessInfo {
  businessName: string | null;
  businessAddress: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
}

interface InvoiceFormProps {
  clients: Client[];
  businessInfo: BusinessInfo | null;
  initialData?: Partial<InvoiceFormData> & { id?: string };
}

export function InvoiceForm({ clients, businessInfo, initialData }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
      invoiceNumber: generateInvoiceNumber(),
      issueDate: today,
      dueDate: thirtyDaysFromNow,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      discount: 0,
      notes: "",
      terms: "Payment is due within 30 days of invoice date.",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchTaxRate = watch("taxRate");
  const watchDiscount = watch("discount");

  const subtotal = watchItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  const taxAmount = subtotal * ((watchTaxRate || 0) / 100);
  const total = subtotal + taxAmount - (watchDiscount || 0);

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);
    try {
      const url = initialData?.id
        ? `/api/invoices/${initialData.id}`
        : "/api/invoices";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          subtotal,
          taxAmount,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save invoice");
      }

      const invoice = await response.json();

      toast({
        title: initialData?.id ? "Invoice updated" : "Invoice created",
        description: `Invoice ${invoice.invoiceNumber} has been saved.`,
      });

      router.push(`/dashboard/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  {...register("invoiceNumber")}
                  placeholder="INV-0001"
                />
                {errors.invoiceNumber && (
                  <p className="text-sm text-destructive">
                    {errors.invoiceNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select
                  onValueChange={(value) => setValue("clientId", value)}
                  defaultValue={initialData?.clientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-sm text-destructive">
                    {errors.clientId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  {...register("issueDate")}
                />
                {errors.issueDate && (
                  <p className="text-sm text-destructive">
                    {errors.issueDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
                {errors.dueDate && (
                  <p className="text-sm text-destructive">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* From Info */}
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent>
            {businessInfo?.businessName ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{businessInfo.businessName}</p>
                {businessInfo.businessAddress && (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {businessInfo.businessAddress}
                  </p>
                )}
                {businessInfo.businessEmail && (
                  <p className="text-muted-foreground">
                    {businessInfo.businessEmail}
                  </p>
                )}
                {businessInfo.businessPhone && (
                  <p className="text-muted-foreground">
                    {businessInfo.businessPhone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add your business info in{" "}
                <a href="/dashboard/settings" className="text-primary underline">
                  Settings
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-4 sm:grid-cols-[1fr,100px,120px,auto]"
            >
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Service or product description"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>

          <Separator />

          <div className="flex flex-col items-end space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-right font-medium">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="taxRate" className="text-sm text-muted-foreground">
                Tax Rate (%):
              </Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                className="w-24"
                {...register("taxRate", { valueAsNumber: true })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span className="text-right">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="discount" className="text-sm text-muted-foreground">
                Discount:
              </Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                className="w-24"
                {...register("discount", { valueAsNumber: true })}
              />
            </div>
            <Separator className="my-2 w-48" />
            <div className="grid grid-cols-2 gap-4 text-lg font-bold">
              <span>Total:</span>
              <span className="text-right">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Notes & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes for the client..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              {...register("terms")}
              placeholder="Payment terms..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : initialData?.id ? (
            "Update Invoice"
          ) : (
            "Create Invoice"
          )}
        </Button>
      </div>
    </form>
  );
}
