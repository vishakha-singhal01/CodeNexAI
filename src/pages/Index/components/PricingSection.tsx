import React, { useState } from 'react'; // Import useState
import { Check, Loader2 } from "lucide-react"; // Import Loader2
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useToast } from "@/components/ui/use-toast"; // Import useToast

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PricingSection = () => {
  const { user, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const { toast } = useToast();

  const handleGetStartedClick = async (plan: 'free' | 'pro' | 'enterprise') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (plan === 'enterprise') {
      navigate('/contact');
    } else if (plan === 'pro') {
      setIsLoadingPro(true);
      toast({ title: "Initiating Pro Plan Upgrade..." });
      // ... existing payment flow ...
    } else if (plan === 'free') {
      toast({ title: "You are already on the Free Plan or can start using it." });
    }
  };

  return (
    <section className="w-full py-20 md:py-28 bg-muted/50">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your workflow—code snippets, full repos, or GitHub URLs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Free Plan Card */}
          <Card className="bg-background/70 backdrop-blur-sm">
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
                  <span>Paste code snippets to generate documentation instantly.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Download in PDF or Markdown formats.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Security-first: ephemeral processing, no code storage.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGetStartedClick('free')}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-primary shadow-xl bg-gradient-to-br from-background to-primary/10 scale-105 relative">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="flex items-baseline mt-4">
                <div className="text-2xl font-semibold">
                  <span className="line-through text-gray-500 mr-2">₹2300</span>
                  <span className="text-4xl font-bold text-black">₹1800 <span className="text-muted-foreground ml-1"></span></span>
                  <span className="block text-sm text-red-500 mt-1">Early bird discount — limited time offer!</span>
                </div>
              
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>All Free features plus folder upload for complete codebases.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Comprehensive PDF & Markdown exports of entire projects.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Priority email support & API integration.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Secure processing with end-to-end encryption.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {/* <Button
                className="w-full"
                onClick={() => handleGetStartedClick('pro')}
                disabled={isLoadingPro || user?.plan === 'pro'}
              >
                {isLoadingPro ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : user?.plan === 'pro' ? (
                  'Current Plan'
                ) : (
                  'Upgrade to Pro'
                )}
              </Button> */}
              <Button
                variant="outline"
                className="w-full bg-black text-white"
                onClick={() => handleGetStartedClick('enterprise')}
              >
                Contact Sales
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan Card */}
          <Card className="bg-background/70 backdrop-blur-sm">
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
                  <span>All Pro features plus GitHub URL import for on-the-fly docs.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Additional languages on-demand beyond standard list.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Dedicated account manager, SLAs, and premium support.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Enterprise-grade security: ephemeral code handling.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Custom integrations: SSO, on-premise deployment, and more.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGetStartedClick('enterprise')}
              >
                Contact Sales
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </section>
  );
};
