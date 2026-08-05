"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCcw, Settings, Link as LinkIcon, Unlink, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const platforms = [
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black text-white dark:bg-white dark:text-black",
    status: "connected",
    accountName: "@socialflow",
    expiresIn: "60 days",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: "bg-[#0A66C2] text-white",
    status: "connected",
    accountName: "SocialFlow Inc.",
    expiresIn: "14 days",
    warning: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    color: "bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] text-white",
    status: "disconnected",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: "bg-[#1877F2] text-white",
    status: "disconnected",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: "bg-black text-white dark:bg-white dark:text-black",
    status: "disconnected",
  }
];

export default function AccountsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Connected Accounts</h2>
          <p className="text-muted-foreground mt-1">Manage your social media profiles and OAuth connections.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform, i) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="flex flex-col h-full border-0 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${platform.color}`}>
                  <platform.icon className="w-6 h-6" />
                </div>
                {platform.status === "connected" ? (
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 border-0">
                    Disconnected
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <CardTitle className="text-lg">{platform.name}</CardTitle>
                
                {platform.status === "connected" ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <span className="truncate">{platform.accountName}</span>
                    </div>
                    {platform.warning ? (
                      <div className="flex items-center text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Token expires in {platform.expiresIn}
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-muted-foreground">
                        Token expires in {platform.expiresIn}
                      </div>
                    )}
                  </div>
                ) : (
                  <CardDescription className="mt-2 text-sm">
                    Connect your {platform.name} account to schedule posts and view analytics.
                  </CardDescription>
                )}
              </CardContent>
              <CardFooter className="pt-0 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                {platform.status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm" className="w-full bg-white dark:bg-slate-900 shadow-sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="outline" size="sm" className={`w-full ${platform.warning ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 hover:bg-rose-100' : 'bg-white dark:bg-slate-900 shadow-sm'}`}>
                      {platform.warning ? <RefreshCcw className="w-4 h-4 mr-2" /> : <Unlink className="w-4 h-4 mr-2 text-muted-foreground" />}
                      {platform.warning ? "Reconnect" : "Disconnect"}
                    </Button>
                  </>
                ) : (
                  <Button variant="default" size="sm" className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 shadow-none border-0">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Account
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Security Note */}
      <Card className="mt-8 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-none">
        <CardContent className="flex items-start gap-4 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Secure OAuth Connection</h4>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1">
              SocialFlow uses secure OAuth 2.0 to connect to your accounts. We never see or store your passwords. Your access tokens are encrypted at rest using AES-256 encryption.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
