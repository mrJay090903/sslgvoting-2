"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Cookie, Settings, Info, ToggleLeft } from "lucide-react";

export default function CookiePolicyPage() {
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
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
              <p className="text-slate-400 text-sm">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 space-y-8">
              
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">What Are Cookies?</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit a website. 
                  They help the website remember your preferences and improve your browsing experience. 
                  The SSLG Voting System uses cookies to ensure secure and efficient operation.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Cookie className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Cookies We Use</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Essential Cookies</h3>
                    <p className="text-slate-300 text-sm">
                      These cookies are necessary for the voting system to function properly. They include:
                    </p>
                    <ul className="text-slate-400 text-sm mt-2 space-y-1">
                      <li>• Authentication tokens to keep you logged in</li>
                      <li>• Session cookies to maintain your voting session</li>
                      <li>• Security cookies to prevent fraud</li>
                    </ul>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Functional Cookies</h3>
                    <p className="text-slate-300 text-sm">
                      These cookies enhance your experience by remembering your preferences:
                    </p>
                    <ul className="text-slate-400 text-sm mt-2 space-y-1">
                      <li>• Language preferences</li>
                      <li>• Display settings</li>
                      <li>• Previously entered information</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Cookie Duration</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 text-slate-300">Cookie Type</th>
                        <th className="text-left py-3 text-slate-300">Duration</th>
                        <th className="text-left py-3 text-slate-300">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-400">
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Session Cookie</td>
                        <td className="py-3">Until browser closes</td>
                        <td className="py-3">Maintain login session</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Auth Token</td>
                        <td className="py-3">7 days</td>
                        <td className="py-3">Remember logged-in user</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3">Vote Session</td>
                        <td className="py-3">30 minutes</td>
                        <td className="py-3">Secure voting process</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ToggleLeft className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Managing Cookies</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  You can control and manage cookies through your browser settings. However, please note 
                  that disabling essential cookies may prevent you from using the voting system properly.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                  <p className="text-amber-200 text-sm">
                    <strong>Important:</strong> Blocking all cookies will prevent you from logging in 
                    and casting your vote. We recommend keeping essential cookies enabled during the 
                    election period.
                  </p>
                </div>
              </section>

              <section className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Questions?</h3>
                <p className="text-slate-300 text-sm">
                  If you have any questions about our use of cookies, please contact the SSLG Office 
                  or school IT department.
                </p>
              </section>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
