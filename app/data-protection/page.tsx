"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Server, Eye, AlertTriangle, CheckCircle } from "lucide-react";

export default function DataProtectionPage() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Data Protection</h1>
              <p className="text-slate-400 text-sm">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 space-y-8">
              
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Our Commitment to Data Protection</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The SSLG Voting System is committed to protecting your personal data and ensuring 
                  the integrity of the election process. We implement comprehensive security measures 
                  to safeguard all information collected through our system.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Security Measures</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-white font-medium">Encryption</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      All data transmitted between your device and our servers is encrypted using 
                      TLS 1.3 protocol.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-white font-medium">Access Control</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Strict role-based access control ensures only authorized personnel can access 
                      sensitive data.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-white font-medium">Vote Anonymization</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Votes are separated from voter identity to ensure ballot secrecy and prevent 
                      vote tracking.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-white font-medium">Audit Logging</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      All system activities are logged for security monitoring and incident response.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Server className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Data Storage</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your data is stored securely with the following protections:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Database encryption at rest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Regular automated backups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Secure data centers with physical security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-1">•</span>
                    <span>Data retained only for the duration necessary</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Data Retention</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 text-slate-300">Data Type</th>
                        <th className="text-left py-3 text-slate-300">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-400">
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Student Information</td>
                        <td className="py-3">Duration of enrollment + 1 year</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Voting Records</td>
                        <td className="py-3">3 years (for audit purposes)</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Session Data</td>
                        <td className="py-3">24 hours</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Audit Logs</td>
                        <td className="py-3">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Data Breach Response</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  In the unlikely event of a data breach, we will:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">1.</span>
                    <span>Immediately investigate and contain the breach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">2.</span>
                    <span>Notify affected students within 72 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">3.</span>
                    <span>Report to school administration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">4.</span>
                    <span>Implement measures to prevent future incidents</span>
                  </li>
                </ul>
              </section>

              <section className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Report a Concern</h3>
                <p className="text-slate-300 text-sm">
                  If you believe your data has been compromised or have concerns about data protection, 
                  please contact the SSLG Office or school IT department immediately.
                </p>
              </section>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
