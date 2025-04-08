import React from 'react';
import { FileText } from 'lucide-react';
import { ModeToggle } from './mode-toggle'; // Import the ModeToggle component

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">
              DocuGen AI
            </span>
          </a>
          {/* Add navigation links here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
