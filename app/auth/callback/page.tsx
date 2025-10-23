"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        showToast({
          type: "error",
          title: "Authentication Error",
          message:
            errorDescription || "An error occurred during authentication",
          duration: 5000,
        });
        router.push("/login");
        return;
      }

      if (!code) {
        showToast({
          type: "error",
          title: "Invalid Link",
          message: "This confirmation link is invalid or has expired",
          duration: 5000,
        });
        router.push("/login");
        return;
      }

      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          showToast({
            type: "error",
            title: "Confirmation Failed",
            message: error.message || "Failed to confirm your email",
            duration: 5000,
          });
          router.push("/login");
          return;
        }

        // Successfully confirmed and signed in
        showToast({
          type: "success",
          title: "Email Confirmed!",
          message: "Your account has been confirmed and you're now signed in.",
          duration: 5000,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err) {
        showToast({
          type: "error",
          title: "Unexpected Error",
          message: "An unexpected error occurred during confirmation",
          duration: 5000,
        });
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? "Confirming your email..." : "Redirecting..."}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    </div>
  );
}
