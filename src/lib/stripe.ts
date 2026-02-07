import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    invoicesPerMonth: 5,
    features: [
      'Up to 5 invoices per month',
      'Unlimited clients',
      'PDF export',
      'Email invoices',
      'Basic templates',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For growing businesses',
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    invoicesPerMonth: Infinity,
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'PDF export',
      'Email invoices',
      'Custom branding',
      'Payment reminders',
      'Analytics dashboard',
      'Priority support',
    ],
  },
} as const;

export async function createCheckoutSession(userId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return session;
}
