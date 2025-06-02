import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, BrainCircuit, Bug, ArrowRight, AlertTriangle, Users, Clock } from "lucide-react"; 
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"

export const ProblemSection = () => {
  return (
   <section className="w-full py-20 md:py-28 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-t">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 text-center mb-16">
            <Badge className="mx-auto bg-red-100 text-red-700 hover:bg-red-200">🚨 The Hidden Developer Crisis</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              The Code{" "}
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Understanding
              </span>{" "}
              Crisis
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Developers spend <strong>60% of their time</strong> trying to understand existing code instead of building
              new features. Legacy codebases, undocumented APIs, and complex architectures are slowing down entire
              teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Stat Cards */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/50 text-center p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">60%</div>
              <p className="text-gray-600 font-medium">Time spent reading code vs writing</p>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/50 text-center p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">3-6</div>
              <p className="text-gray-600 font-medium">Months to onboard new developers</p>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/50 text-center p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">40%</div>
              <p className="text-gray-600 font-medium">Of bugs from misunderstood code</p>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/50 text-center p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">$85B</div>
              <p className="text-gray-600 font-medium">Annual cost of technical debt</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-red-50/30 hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Endless Code Archaeology</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Developers waste hours digging through undocumented legacy code, trying to understand what it does and
                  why it exists.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">"What does this function actually do?"</span>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">"Why was this implemented this way?"</span>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">"Is it safe to modify this code?"</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50/30 hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Painful Team Onboarding</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  New developers spend months just trying to understand the codebase before they can contribute
                  meaningfully.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Senior devs constantly interrupted for explanations</span>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Junior devs afraid to touch "critical" code</span>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Knowledge trapped in senior developers' heads</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Costly Misunderstandings</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  When developers don't understand code behavior, they introduce bugs, break integrations, and create
                  technical debt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Production bugs from misunderstood logic</span>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Broken integrations and API misuse</span>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Accumulating technical debt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                What if you could understand any codebase in seconds?
              </h3>
              <p className="text-xl text-red-100 mb-6 max-w-3xl mx-auto">
                Stop wasting time on code archaeology. CodeNexAI instantly explains any code, from single functions to
                entire repositories.
              </p>
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-6">
                See How It Works
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
  );
};
