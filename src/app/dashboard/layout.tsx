import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { Footer } from "@/components/footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto p-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
