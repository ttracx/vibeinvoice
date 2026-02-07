import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessName: true,
        businessAddress: true,
        businessEmail: true,
        businessPhone: true,
      },
    });

    // Generate HTML for PDF
    const html = generateInvoiceHTML(invoice, user);

    // Return HTML for now (in production, use a PDF library like puppeteer or @react-pdf/renderer)
    // For now, we return HTML that can be printed as PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any, business: any) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .title { font-size: 32px; font-weight: bold; color: #7c3aed; margin-bottom: 8px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #166534; }
    .business-info { text-align: right; }
    .business-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .text-muted { color: #6b7280; font-size: 13px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.final { font-size: 18px; font-weight: bold; border-top: 2px solid #1a1a1a; margin-top: 8px; padding-top: 16px; }
    .notes { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .notes h4 { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
    .notes p { font-size: 13px; white-space: pre-line; }
    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #6b7280; }
    @media print { body { padding: 0; } @page { margin: 40px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">INVOICE</div>
      <span class="status">${invoice.status}</span>
    </div>
    <div class="business-info">
      ${business?.businessName ? `<div class="business-name">${business.businessName}</div>` : ''}
      ${business?.businessAddress ? `<div class="text-muted">${business.businessAddress.replace(/\n/g, '<br>')}</div>` : ''}
      ${business?.businessEmail ? `<div class="text-muted">${business.businessEmail}</div>` : ''}
      ${business?.businessPhone ? `<div class="text-muted">${business.businessPhone}</div>` : ''}
    </div>
  </div>

  <div class="info-grid">
    <div>
      <div class="section-title">Bill To</div>
      <div style="font-weight: 500;">${invoice.client.name}</div>
      ${invoice.client.company ? `<div class="text-muted">${invoice.client.company}</div>` : ''}
      <div class="text-muted">${invoice.client.email}</div>
      ${invoice.client.phone ? `<div class="text-muted">${invoice.client.phone}</div>` : ''}
      ${invoice.client.address ? `<div class="text-muted">${invoice.client.address.replace(/\n/g, '<br>')}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <div><span class="text-muted">Invoice Number: </span><strong>${invoice.invoiceNumber}</strong></div>
      <div><span class="text-muted">Issue Date: </span><strong>${formatDate(invoice.issueDate)}</strong></div>
      <div><span class="text-muted">Due Date: </span><strong>${formatDate(invoice.dueDate)}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map((item: any) => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right">${formatCurrency(item.amount)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span class="text-muted">Subtotal</span>
      <span>${formatCurrency(invoice.subtotal)}</span>
    </div>
    ${invoice.taxRate > 0 ? `
      <div class="total-row">
        <span class="text-muted">Tax (${invoice.taxRate}%)</span>
        <span>${formatCurrency(invoice.taxAmount)}</span>
      </div>
    ` : ''}
    ${invoice.discount > 0 ? `
      <div class="total-row">
        <span class="text-muted">Discount</span>
        <span>-${formatCurrency(invoice.discount)}</span>
      </div>
    ` : ''}
    <div class="total-row final">
      <span>Total</span>
      <span>${formatCurrency(invoice.total)}</span>
    </div>
  </div>

  ${invoice.notes || invoice.terms ? `
    <div class="notes">
      ${invoice.notes ? `<h4>Notes</h4><p>${invoice.notes}</p>` : ''}
      ${invoice.terms ? `<h4 style="margin-top: 16px;">Terms & Conditions</h4><p>${invoice.terms}</p>` : ''}
    </div>
  ` : ''}

  <div class="footer">
    <p>© 2026 VibeInvoice powered by VibeCaaS.com a division of NeuralQuantum.ai LLC</p>
  </div>
</body>
</html>
  `;
}
