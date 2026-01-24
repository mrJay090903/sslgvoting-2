"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-slate-400 text-sm">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 space-y-8">
              
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Information We Collect</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The SSLG Voting System collects the following information to facilitate the election process:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span><strong>Student Information:</strong> Student ID, Full Name, Grade Level, Email Address, and Contact Number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span><strong>Voting Records:</strong> Anonymous voting data to ensure election integrity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span><strong>Authentication Data:</strong> Login credentials and session information</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">How We Use Your Information</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your information is used exclusively for:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Verifying student eligibility to vote</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Preventing duplicate voting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Generating election statistics and reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Communicating important election-related announcements</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Data Protection</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Encrypted data transmission (HTTPS/TLS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Secure database storage with access controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Regular security audits and monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Vote anonymization to protect ballot secrecy</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Your Rights</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  As a student, you have the right to:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Access your personal information stored in the system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Request correction of inaccurate data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Know how your data is being used</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>File a complaint regarding data handling</span>
                  </li>
                </ul>
              </section>

              <section className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Questions or Concerns?</h3>
                <p className="text-slate-300 text-sm">
                  If you have any questions about this Privacy Policy, please contact the SSLG Office 
                  or the school administration. We are committed to protecting your privacy and ensuring 
                  a fair and transparent election process.
                </p>
              </section>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
