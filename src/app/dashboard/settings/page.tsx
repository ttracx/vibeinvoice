import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      businessName: true,
      businessAddress: true,
      businessEmail: true,
      businessPhone: true,
      businessLogo: true,
      stripeCustomerId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and business settings
        </p>
      </div>

      <SettingsForm user={user} isPro={!!user?.stripePriceId} />
    </div>
  );
}
