"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Vote, CheckCircle, Clock, AlertCircle, HelpCircle, ListChecks } from "lucide-react";

export default function VotingGuidelinesPage() {
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
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voting Guidelines</h1>
              <p className="text-slate-400 text-sm">Everything you need to know about voting</p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 space-y-8">
              
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">How to Vote</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Enter Your Student ID</h3>
                      <p className="text-slate-400 text-sm">
                        On the home page, enter your official Student ID number in the verification field.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Verify Your Identity</h3>
                      <p className="text-slate-400 text-sm">
                        The system will verify your eligibility to vote. You must be a registered student.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Select Your Candidates</h3>
                      <p className="text-slate-400 text-sm">
                        Choose one candidate for each position. You can view candidate profiles, platforms, 
                        vision, and mission before making your decision.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Review Your Ballot</h3>
                      <p className="text-slate-400 text-sm">
                        Before submitting, review all your selections carefully. Make sure you've voted 
                        for all positions you want to vote for.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Submit Your Vote</h3>
                      <p className="text-slate-400 text-sm">
                        Click "Submit Vote" to finalize your ballot. Once submitted, your vote cannot 
                        be changed.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Eligibility Requirements</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  To vote in the SSLG election, you must:
                </p>
                <ul className="text-slate-300 space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Be a currently enrolled student (Grades 7-12)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Have your Student ID registered in the system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Not have voted previously in the current election</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Vote during the official election period</span>
                  </li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Voting Period</h2>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-300">
                    The voting period will be announced by the SSLG Election Committee. Make sure to:
                  </p>
                  <ul className="text-slate-400 text-sm mt-3 space-y-1">
                    <li>• Check announcements for the official voting schedule</li>
                    <li>• Vote within the designated time frame</li>
                    <li>• Complete your vote in one session (votes cannot be saved as draft)</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Important Reminders</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm">
                      <strong>One Vote Only:</strong> You can only vote once. Make sure your selections 
                      are final before submitting.
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm">
                      <strong>Keep It Confidential:</strong> Never share your Student ID with others 
                      or let someone else vote on your behalf.
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm">
                      <strong>Session Timeout:</strong> Your voting session will expire after 30 minutes 
                      of inactivity. Complete your vote in time.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-semibold text-white m-0">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Can I change my vote after submitting?</h3>
                    <p className="text-slate-400 text-sm">
                      No, once your vote is submitted, it cannot be changed. This ensures election integrity.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">What if I don't want to vote for a position?</h3>
                    <p className="text-slate-400 text-sm">
                      You may abstain from voting for specific positions. Simply don't select any candidate 
                      for that position before submitting.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">How do I know my vote was counted?</h3>
                    <p className="text-slate-400 text-sm">
                      After successful submission, you'll receive a confirmation message. Your vote is 
                      anonymously recorded in the system.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">What if I encounter a technical issue?</h3>
                    <p className="text-slate-400 text-sm">
                      Contact the SSLG Election Committee or school IT support immediately. Do not 
                      attempt to vote multiple times.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
                <p className="text-slate-300 text-sm">
                  If you have questions or need assistance with voting, visit the SSLG Office 
                  or contact the Election Committee. We're here to ensure every student can 
                  exercise their right to vote.
                </p>
              </section>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
