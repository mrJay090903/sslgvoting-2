"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function VoteSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-green-100">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Vote Successfully Cast!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for participating in the student government election. Your vote has been recorded securely.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium text-blue-900">Remember:</p>
            <p className="text-blue-700">
              Your vote is confidential and cannot be changed. Results will be announced after the election closes.
            </p>
          </div>
          <Link href="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
