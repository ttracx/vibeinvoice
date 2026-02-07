# VibeInvoice

A simple, modern invoice generator built with Next.js 14, Tailwind CSS, and shadcn/ui.

![VibeInvoice](https://vibecaas.com/assets/VibeCaaSIcon_1754083072925-B9dmwIle.png)

## Features

- 📝 **Create & Edit Invoices** - Professional invoices with line items, taxes, and discounts
- 👥 **Client Management** - Organize all your clients in one place
- 📄 **PDF Export** - Download professional PDF invoices
- 💰 **Payment Tracking** - Track paid, pending, and overdue invoices
- ⏰ **Due Date Management** - Never miss a payment deadline
- 📊 **Analytics Dashboard** - Visualize your revenue and invoice stats
- 🎨 **Custom Branding** - Add your business info to invoices

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Payments:** Stripe

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 5 invoices/month, Unlimited clients, PDF export |
| **Pro** | $12/month | Unlimited invoices, Custom branding, Payment reminders, Analytics |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for subscriptions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ttracx/vibeinvoice.git
cd vibeinvoice
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. Initialize the database:
```bash
pnpm prisma generate
pnpm prisma db push
```

6. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ttracx/vibeinvoice)

### Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`

## Stripe Setup

1. Create a product in Stripe Dashboard:
   - Name: "VibeInvoice Pro"
   - Price: $12/month (recurring)

2. Get the Price ID and add it to `STRIPE_PRO_PRICE_ID`

3. Set up Stripe webhooks:
   - Endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

## Project Structure

```
vibeinvoice/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── login/          # Auth pages
│   │   └── pricing/        # Pricing page
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utility functions
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Prisma client
│   │   ├── stripe.ts      # Stripe config
│   │   └── utils.ts       # Helpers
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript types
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

## License

© 2026 VibeInvoice powered by [VibeCaaS.com](https://vibecaas.com) a division of [NeuralQuantum.ai LLC](https://www.neuralquantum.ai). All rights reserved.
