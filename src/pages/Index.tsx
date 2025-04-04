
import { ArrowRight, Check, Code, FileText, GitBranch, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 lg:py-32 border-b">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto flex flex-col items-center text-center gap-8">
          <Badge variant="outline" className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary mb-2">
            Beta Access Available
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Documentation that <span className="text-primary">writes itself</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically generate and maintain technical documentation using AI. Save time, reduce errors, and keep docs in sync with your code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button size="lg" className="h-12 px-8 font-medium">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 font-medium">
              Book a demo
            </Button>
          </div>
          <div className="relative w-full max-w-4xl aspect-video rounded-lg border overflow-hidden mt-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
              <FileText className="h-24 w-24 text-primary/20" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-md border border-white/20">
                  <Code className="h-8 w-8 text-white mb-2" />
                  <p className="text-white text-lg font-medium">Demo Video Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="w-full py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Documentation Problem</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Documentation is often outdated, inconsistent, or missing entirely. This leads to:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Increased Onboarding Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  New team members spend weeks figuring out how systems work instead of delivering value.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Silos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Developers constantly interrupt each other to ask about APIs, modules, and implementation details.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bugs & Misuse</CardTitle>
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

      {/* Features Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform analyzes your codebase to generate comprehensive documentation that stays in sync with your code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
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
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>LLM-Powered Generator</CardTitle>
                <CardDescription className="text-md">
                  Uses advanced AI to create comprehensive documentation
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
            <Card className="border-primary/20">
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

      {/* Integrations Section */}
      <section className="w-full py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Powerful Integrations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with your existing tools and workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
            {["GitHub", "GitLab", "Swagger", "OpenAPI", "Postman", "Docusaurus"].map((integration) => (
              <div key={integration} className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-xl bg-background border shadow-sm flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary/70">{integration.charAt(0)}</span>
                </div>
                <span className="font-medium">{integration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pick the plan that fits your team's needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Up to 1 repository</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Maximum 100 files</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Basic API documentation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Community support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Get Started</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary/50 shadow-md relative bg-primary/[0.03]">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground ml-1">/month per dev</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Unlimited repositories</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Advanced API documentation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Code examples generation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>All integrations included</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Free Trial</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>SSO & advanced security</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>On-premise deployment option</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Dedicated support manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to transform your documentation?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of developers who are saving time and reducing errors with AI-generated documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-12 px-8 font-medium">
              Get started free
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 font-medium border-primary-foreground/30 hover:bg-primary-foreground/10">
              Schedule a demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl">DocuGen AI</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 DocuGen AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
