import React from 'react';
import { Button } from "@/components/ui/button";

export const CtaSection = () => {
  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to Automate Your Documentation?</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">
          Focus on building great software, not writing docs. Sign up for early access and experience the future of technical documentation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-black/30 transition-shadow duration-300">
            Request Early Access
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-primary-foreground/50 hover:bg-primary-foreground/10 text-primary-foreground">
            Schedule a demo
          </Button>
        </div>
      </div>
    </section>
  );
};


