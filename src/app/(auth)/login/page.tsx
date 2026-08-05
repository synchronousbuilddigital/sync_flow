"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
    // Mock traditional login for now
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            0% {
              opacity: 0;
              transform: translateX(100px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}
      </style>
      <Card className="border border-white/40 shadow-[0_16px_40px_0_rgba(31,38,135,0.1)] bg-white/10 backdrop-blur-3xl text-orange-950 relative overflow-hidden w-full max-w-md mx-auto animate-slide-in-right">
        <CardHeader className="space-y-2 text-center lg:text-left p-6 pb-6 relative z-10">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-orange-950 drop-shadow-sm">Welcome back</CardTitle>
          <CardDescription className="text-orange-900/90 text-base font-semibold">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-orange-950 font-bold">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="bg-white/30 border-white/50 text-orange-950 placeholder:text-orange-900/40 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-12 backdrop-blur-sm transition-all shadow-sm font-medium"
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-orange-950 font-bold">Password</Label>
                <Link href="#" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors drop-shadow-sm">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="bg-white/30 border-white/50 text-orange-950 placeholder:text-orange-900/40 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-12 backdrop-blur-sm transition-all shadow-sm font-medium"
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-all h-12 text-base mt-2 border border-white/20 font-bold" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-orange-200/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-4 text-orange-700 font-extrabold tracking-widest backdrop-blur-none drop-shadow-sm">
                or
              </span>
            </div>
          </div>
        </CardContent>
        
        {/* Edge-to-edge bottom section */}
        <div className="mt-2 bg-transparent border-t border-orange-200/40 relative z-10 flex flex-col">
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white/20 border-0 border-b border-orange-200/40 text-orange-950 hover:bg-white/40 hover:text-orange-950 transition-all h-16 text-base font-bold rounded-none"
          >
            <svg className="mr-3 h-5 w-5 text-orange-700" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Sign in with Google
          </Button>
          <div className="flex items-center justify-center p-4">
            <div className="text-sm font-semibold text-orange-900/90">
              Are you new?{" "}
              <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-extrabold hover:underline transition-colors drop-shadow-sm">
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
