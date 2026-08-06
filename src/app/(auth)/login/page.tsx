"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      <Card
        className="animate-slide-in-right w-full border shadow-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.3) inset",
          borderColor: "rgba(249,115,22,0.4)",
        }}
      >
        {/* Header */}
        <CardHeader className="px-7 pt-7 pb-5 text-center">
          <CardTitle className="text-4xl font-bold text-gray-900">Welcome back</CardTitle>
          <CardDescription className="text-gray-600 text-sm mt-1">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent className="px-7 pb-0">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-800 text-base font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                className="h-11 rounded-xl text-gray-900 placeholder:text-gray-400 text-base"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-800 text-base font-medium">
                  Password
                </Label>
                <Link href="#" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 rounded-xl text-gray-900 placeholder:text-gray-400 text-base"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold text-white rounded-xl border-0 mt-1"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                boxShadow: "0 4px 18px rgba(249,115,22,0.5)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>

          {/* Divider — no lines, just text */}
          <div className="relative my-6 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">or</span>
          </div>
        </CardContent>

        {/* Google + Footer — no dark borders */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 h-14 text-base font-semibold text-gray-800 hover:text-gray-900 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <svg className="h-4 w-4 flex-shrink-0" aria-hidden="true" viewBox="0 0 488 512" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center justify-center py-4 px-7">
            <p className="text-base text-gray-700">
              Are you new?{" "}
              <Link href="/signup" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </Card>

    </>
  );
}
