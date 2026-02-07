import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileText, Users, Download, Clock, Bell, CheckCircle } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Create Professional Invoices",
      description: "Design beautiful invoices with your branding in minutes. Add line items, taxes, and discounts easily.",
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Keep all your client information organized in one place. Quick access to client history and contacts.",
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Generate professional PDF invoices ready to send. Download or email directly to your clients.",
    },
    {
      icon: Clock,
      title: "Payment Tracking",
      description: "Track payment status for every invoice. Know what's paid, pending, or overdue at a glance.",
    },
    {
      icon: Bell,
      title: "Due Date Reminders",
      description: "Never miss a payment again. Automated reminders for upcoming and overdue invoices.",
    },
    {
      icon: CheckCircle,
      title: "Status Management",
      description: "Update invoice status from draft to paid. Complete visibility into your billing workflow.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                Create Beautiful Invoices in{" "}
                <span className="text-primary">Seconds</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                VibeInvoice is the simplest way to create, send, and track invoices. 
                Professional billing made easy for freelancers and small businesses.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/login">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free plan includes 5 invoices/month. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" id="features">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Everything You Need to Get Paid
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Powerful features to help you manage your invoicing workflow efficiently.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="bg-muted/50 py-20" id="pricing-preview">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">
                Start free, upgrade when you need more.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              <Card className="border-2">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Up to 5 invoices per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Unlimited clients
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      PDF export
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Basic templates
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$12</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Unlimited invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Unlimited clients
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Custom branding
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Payment reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Analytics dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Priority support
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/login">Start Pro Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Streamline Your Invoicing?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Join thousands of freelancers and businesses who trust VibeInvoice for their billing needs.
              </p>
              <Button size="lg" asChild>
                <Link href="/login">Create Your First Invoice</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
