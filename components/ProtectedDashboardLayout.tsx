"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Activity } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isLoggedIn = isAuthenticated && !isLoading;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/dashboard/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !pathname.includes("/login")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>You must be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
