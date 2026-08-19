import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy - SyncFlow',
  description: 'Privacy Policy and Data Deletion Instructions for SyncFlow',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full h-full pb-20">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full dark:bg-indigo-500/10 dark:text-indigo-400">
            Legal & Compliance
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Last Updated: August 19, 2026</p>
        </div>

        <article className="prose prose-slate dark:prose-invert lg:prose-lg mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Welcome to SyncFlow ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                When you use SyncFlow, we may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign up for our platform.</li>
                <li><strong>Third-Party Authentication Data:</strong> When you connect your social media accounts (including Facebook, Instagram, LinkedIn, YouTube, TikTok, and Threads), we collect access tokens (OAuth tokens) and account identifiers to act on your behalf.</li>
                <li><strong>Social Media Data:</strong> We retrieve and store your connected pages, profiles, and basic analytics strictly to provide our scheduling and reporting features. We <strong>do not</strong> collect or store your passwords for these third-party services.</li>
                <li><strong>User-Generated Content:</strong> Media files (photos and videos) and captions that you upload to our platform to be scheduled and published to your social media accounts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                We use the information we collect strictly to provide and improve our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
                <li>To authenticate you and maintain your session.</li>
                <li>To publish content (text, photos, videos) to your connected social media profiles (e.g., Facebook Pages, Instagram Accounts) at your direct request.</li>
                <li>To fetch basic analytics and engagement metrics to display in your SyncFlow dashboard.</li>
                <li>To communicate with you regarding account updates or technical issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                We do not sell, rent, or trade your personal information. We only share information with third parties in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Social Media Platforms:</strong> We transmit your content to Facebook, Instagram, LinkedIn, etc., when you instruct us to publish a post.</li>
                <li><strong>Cloud Service Providers:</strong> We use trusted third-party services (like Supabase and Cloudinary) to securely store your data and media files. These providers are bound by strict confidentiality agreements.</li>
                <li><strong>Legal Requirements:</strong> If required by law, court order, or governmental request.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Data Retention and Security</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We use industry-standard encryption to secure your data. We retain your personal information and social media tokens only for as long as your account is active. Once an account is deleted, all associated data, including OAuth tokens and scheduled posts, are permanently purged from our systems.
              </p>
            </section>

            <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
                User Rights & Data Deletion
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-medium">
                You have the right to access, modify, or delete your personal information at any time. To request the complete deletion of your data:
              </p>
              <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-300">
                <li>Log into your SyncFlow account and navigate to your <strong>Settings</strong> page.</li>
                <li>Click on <strong>"Delete Account"</strong> to permanently remove your profile, scheduled posts, and all associated OAuth tokens from our database.</li>
                <li>To revoke access directly from Meta: Navigate to your Facebook Settings &rarr; Business Integrations &rarr; find SyncFlow and click <strong>Remove</strong>.</li>
              </ol>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4 text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                If you cannot access your account, you can request manual data deletion by contacting our support team. We will process all deletion requests within 7 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Changes to This Privacy Policy</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
