"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Users } from "lucide-react";

export default function TermsOfServicePage() {
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-slate-400 text-sm">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 space-y-8">
              
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Acceptance of Terms</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  By accessing and using the SSLG Voting System, you agree to be bound by these Terms of Service. 
                  This system is provided exclusively for enrolled students of the institution to participate 
                  in official student government elections.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">User Eligibility</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  To use this voting system, you must:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Be a currently enrolled student with a valid Student ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Be registered in the official student database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Not have been disqualified from voting by school administration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Use only your own credentials to access the system</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">User Responsibilities</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  As a user of this system, you agree to:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Vote only once per election</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Keep your login credentials confidential</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Not attempt to manipulate or interfere with the voting process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Report any suspicious activity or technical issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Respect the democratic process and other students' right to vote</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Prohibited Activities</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The following activities are strictly prohibited and may result in disciplinary action:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✕</span>
                    <span>Attempting to vote multiple times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✕</span>
                    <span>Using another student's credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✕</span>
                    <span>Attempting to hack, exploit, or compromise the system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✕</span>
                    <span>Coercing or bribing other students to vote a certain way</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✕</span>
                    <span>Spreading misinformation about candidates or the voting process</span>
                  </li>
                </ul>
              </section>

              <section className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Disclaimer</h3>
                <p className="text-slate-300 text-sm">
                  The SSLG Voting System is provided "as is" for educational purposes. While we strive 
                  to maintain system availability and accuracy, we cannot guarantee uninterrupted service. 
                  The school administration reserves the right to modify these terms at any time.
                </p>
              </section>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
