import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, BrainCircuit, Bug } from "lucide-react"; // Import icons

export const ProblemSection = () => {
  return (
    <section className="w-full py-20 md:py-28 bg-muted/50 border-t">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Documentation Problem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Documentation is often outdated, inconsistent, or missing entirely. This leads to:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example Card - Repeat or modify for others */}
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0"> {/* Use flex for icon alignment */}
              <UsersRound className="h-6 w-6 text-primary" /> {/* Add icon */}
              <CardTitle className="text-lg font-semibold">Slow Onboarding</CardTitle> {/* Adjusted title size */}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                New team members spend weeks figuring out how systems work instead of delivering value.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <BrainCircuit className="h-6 w-6 text-primary" /> {/* Add icon */}
              <CardTitle className="text-lg font-semibold">Knowledge Silos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Developers constantly interrupt each other to ask about APIs, modules, and implementation details.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <Bug className="h-6 w-6 text-primary" /> {/* Add icon */}
              <CardTitle className="text-lg font-semibold">Bugs & Misuse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Poor documentation leads to misunderstanding code behavior, causing bugs and production issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
