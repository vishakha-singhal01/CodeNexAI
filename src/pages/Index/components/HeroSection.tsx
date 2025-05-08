import React from 'react';
import { ArrowRight, Code, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full py-24 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
        {/* Removed Beta Badge for cleaner look, can be added back */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 pb-2">
          AI-Powered Documentation <br /> That Writes Itself
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Stop wasting time on manual documentation. Let AI analyze your codebase, generate comprehensive docs, and keep them automatically updated.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
          <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-primary/30 transition-shadow duration-300" onClick={() => navigate('/contact')} >
            Request Early Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base font-semibold"
            onClick={() => {
              const generatorSection = document.getElementById('generator-section');
              generatorSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Try the Generator
          </Button>
        </div>
        {/* Simplified placeholder graphic */}
        <div className="relative w-full max-w-4xl aspect-video rounded-lg border bg-muted/50 overflow-hidden mt-12 shadow-lg">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/-hOP15RYckM?si=WHyJ78_oXV97DtPM"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};
