import React from 'react';
import { Check, Code, GitBranch, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

export const FeaturesSection = () => {
  return (
    <section
      id="how-it-works"
      className="relative py-20 md:py-28 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
      <div className="container relative px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-16">
          <Badge className="mx-auto bg-blue-100 text-blue-700 hover:bg-blue-200">
            ⚡ Live on VS Code Marketplace
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            CodeNexAI explains existing code instead of generating it. Select any code snippet, upload files, or paste
            GitHub repos - get instant explanations, documentation, and optimization suggestions in seconds.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="pb-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Code className="h-8 w-8 text-white" />
              </div>
              <Badge className="w-fit mb-2 bg-blue-100 text-blue-700">Step 1</Badge>
              <CardTitle className="text-2xl">Select Your Code</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Choose how you want to analyze your code - VS Code extension, GitHub repos, or direct file upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Right-click in VS Code → "CodeNexAI"</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Paste GitHub repo links (public/private)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Upload files or entire folders</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">20+ programming languages supported</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/50 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="pb-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <Badge className="w-fit mb-2 bg-purple-100 text-purple-700">Step 2</Badge>
              <CardTitle className="text-2xl">AI Analysis & Documentation</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Advanced AI instantly understands your code and generates doc with
                optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">20 documentation types (API, Tutorial, FAQ, Conceptual etc.)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Code optimization suggestions</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Architecture & logic flow explanations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Secure processing (never stored)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/50 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="pb-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <GitBranch className="h-8 w-8 text-white" />
              </div>
              <Badge className="w-fit mb-2 bg-green-100 text-green-700">Step 3</Badge>
              <CardTitle className="text-2xl">Export & Share</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Get enterprise-level documentation with diagrams, tables, and flowcharts ready to share with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Professional formatting with diagrams</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Multiple export formats</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Team collaboration features</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Senior developer-level quality</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                🎯 Perfect for Legacy Codebases & External Repos
              </h3>
              <p className="text-xl text-blue-100 mb-6 max-w-4xl mx-auto">
                Unlike Copilot or Cursor that generate code, CodeNexAI specializes in understanding and explaining
                existing code. Ideal for onboarding, code reviews, and maintaining large codebases.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge className="bg-white/20 text-white hover:bg-white/30">No Prompt Engineering</Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30">Instant Results</Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30">Enterprise Security</Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30">17+ Languages</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
