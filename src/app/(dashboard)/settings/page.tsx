"use client";

import { Settings, Shield, CreditCard, Users, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 p-8 bg-slate-50/50 min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Settings</h1>
            <p className="text-slate-500 text-sm">Manage your brand preferences, billing, and team connections.</p>
          </div>
        </div>

        {/* Placeholder Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "General", icon: Settings, desc: "Brand name, logo, and timezone" },
            { title: "Team Members", icon: Users, desc: "Invite colleagues and manage roles" },
            { title: "Billing & Plans", icon: CreditCard, desc: "Manage subscription and payment methods" },
            { title: "Notifications", icon: Bell, desc: "Email digests and alert preferences" },
            { title: "Security", icon: Shield, desc: "Two-factor auth and active sessions" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-orange-900 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
