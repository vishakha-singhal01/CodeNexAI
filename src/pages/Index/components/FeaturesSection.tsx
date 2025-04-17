import React from 'react';
import { Check, Code, GitBranch, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FeaturesSection = () => {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform analyzes your codebase to generate comprehensive documentation that stays in sync with your code.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Codebase Analysis</CardTitle>
              <CardDescription className="text-md">
                Scans your entire codebase to understand structure and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Python, JavaScript, TypeScript, Java, and more</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Function signatures and class hierarchies</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Comments and existing documentation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
               </div>
               <CardTitle>LLM-Powered Generator</CardTitle>
               <CardDescription className="text-md">
                 Uses advanced AI to create comprehensive documentation. Securely generate documentation - your code is processed in memory and never stored.
               </CardDescription>
             </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Explains function and class purposes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Creates API endpoint documentation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Adds examples and usage patterns</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Auto Update Engine</CardTitle>
              <CardDescription className="text-md">
                Keeps documentation in sync with code changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Monitors GitHub/GitLab PRs</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Regenerates docs for changed code</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Creates "Doc diff" for review</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
