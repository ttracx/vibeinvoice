"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Crown } from "lucide-react";

interface User {
  businessName: string | null;
  businessAddress: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessLogo: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

interface SettingsFormProps {
  user: User | null;
  isPro: boolean;
}

export function SettingsForm({ user, isPro }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const [formData, setFormData] = useState({
    businessName: user?.businessName || "",
    businessAddress: user?.businessAddress || "",
    businessEmail: user?.businessEmail || "",
    businessPhone: user?.businessPhone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Settings saved",
        description: "Your business information has been updated.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription portal",
        variant: "destructive",
      });
    } finally {
      setIsManaging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            {isPro && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="mr-1 h-3 w-3" />
                Pro
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPro
                  ? `Your subscription renews on ${new Date(user?.stripeCurrentPeriodEnd || "").toLocaleDateString()}`
                  : "5 invoices per month"}
              </p>
            </div>
            {isPro ? (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isManaging}
              >
                {isManaging ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Manage Subscription
              </Button>
            ) : (
              <Button asChild>
                <a href="/pricing">Upgrade to Pro</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information will appear on your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="Your Business Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, businessEmail: e.target.value })
                  }
                  placeholder="billing@yourbusiness.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                type="tel"
                value={formData.businessPhone}
                onChange={(e) =>
                  setFormData({ ...formData, businessPhone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                value={formData.businessAddress}
                onChange={(e) =>
                  setFormData({ ...formData, businessAddress: e.target.value })
                }
                placeholder="123 Business St&#10;Suite 100&#10;City, State 12345"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
