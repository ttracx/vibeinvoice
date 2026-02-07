"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CheckCircle, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/stripe";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = session?.user?.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Choose the plan that works best for you. Start free, upgrade anytime.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <Card className="border-2 flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{PLANS.free.name}</CardTitle>
                <CardDescription>{PLANS.free.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">${PLANS.free.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {PLANS.free.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={session ? "/dashboard" : "/login"}>
                    {session ? "Go to Dashboard" : "Get Started Free"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{PLANS.pro.name}</CardTitle>
                <CardDescription>{PLANS.pro.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">${PLANS.pro.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {PLANS.pro.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isPro ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/settings">Manage Subscription</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Upgrade to Pro"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">What happens when I reach the free plan limit?</h3>
                <p className="text-muted-foreground">
                  On the free plan, you can create up to 5 invoices per month. After reaching the limit, you&apos;ll need to wait until next month or upgrade to Pro for unlimited invoices.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee. If you&apos;re not satisfied with VibeInvoice Pro, contact us within 14 days for a full refund.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Is my payment information secure?</h3>
                <p className="text-muted-foreground">
                  Absolutely. We use Stripe for payment processing, which is PCI compliant and uses industry-standard encryption to protect your payment data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
