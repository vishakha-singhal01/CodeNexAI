import React from 'react';
import { FileText } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full py-8 border-t bg-background">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">DocuGen AI</span>
          </div>
          <div className="flex gap-6 text-sm">
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
  );
};
