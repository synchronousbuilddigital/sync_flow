"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

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
        <CardHeader className="px-7 pt-7 pb-5 text-center">
          <CardTitle className="text-4xl font-bold text-gray-900">Create an account</CardTitle>
          <CardDescription className="text-gray-800 text-base mt-1 font-medium">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 pb-7">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-800 text-base font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                className="h-11 rounded-xl text-gray-900 placeholder:text-gray-400 text-base"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-800 text-base font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-11 rounded-xl text-gray-900 placeholder:text-gray-400 text-base"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-800 text-base font-medium">
                Password
              </Label>
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
              className="w-full h-11 text-base font-semibold text-white rounded-xl border-0 mt-1 text-center"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                boxShadow: "0 4px 18px rgba(249,115,22,0.5)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-7 py-4 flex items-center justify-center">
          <p className="text-base text-gray-900 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
