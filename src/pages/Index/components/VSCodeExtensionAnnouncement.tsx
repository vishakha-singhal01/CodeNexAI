import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, UserPlus, MousePointer, FileText, Zap } from 'lucide-react'; // Added icons

const VSCodeExtensionAnnouncement: React.FC = () => {
  const steps = [
    {
      icon: <Download className="h-8 w-8 mb-2 text-green-500" />, // Adjusted color for potentially lighter muted bg
      title: 'Install Extension',
      description: 'Get our extension from the VS Code Marketplace.',
    },
    {
      icon: <UserPlus className="h-8 w-8 mb-2 text-blue-500" />, // Adjusted color
      title: 'Sign Up & Verify',
      description: 'Create an account at codenexai.com and verify your email.',
    },
    {
      icon: <MousePointer className="h-8 w-8 mb-2 text-yellow-500" />, // Adjusted color
      title: 'Select Code',
      description: 'Highlight the code snippet you want to document in your editor.',
    },
    {
      icon: <Zap className="h-8 w-8 mb-2 text-red-500" />, // Adjusted color
      title: 'Right-Click & Generate',
      description: 'Right-click and choose "CodenexAI: Generate Documentation".',
    },
    {
      icon: <FileText className="h-8 w-8 mb-2 text-purple-500" />, // Adjusted color
      title: 'Get Documentation',
      description: 'Your code documentation will appear directly in VS Code!',
    },
  ];

  return (
    <section className="py-16 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold mb-6 text-secondary-foreground">
          🚀 Supercharge Your Workflow with Our VS Code Extension!
        </h2>
        <p className="text-xl mb-10 max-w-3xl mx-auto text-secondary-foreground/90">
          Generate code documentation instantly, right within your editor. Boost productivity and maintain clarity with CodeNexAI.
        </p>
        <div className="flex justify-center mb-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg transform transition-all hover:scale-105"
            onClick={() => window.open('https://marketplace.visualstudio.com/items/?itemName=CodeNexAI.codenexai-documentation', '_blank')}
          >
            <Download className="mr-2 h-5 w-5" /> Install from Marketplace
          </Button>
        </div>

        <h3 className="text-3xl font-bold mb-10 text-secondary-foreground">How to Get Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card text-card-foreground p-6 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-primary/20 flex flex-col items-center"
            >
              <div className="p-3 bg-muted rounded-full mb-4">
                {step.icon}
              </div>
              <h4 className="text-xl font-semibold mb-2 text-card-foreground">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
         <p className="mt-12 text-md text-secondary-foreground/80">
          Available now on the Visual Studio Code Marketplace.
        </p>
      </div>
    </section>
  );
};

export default VSCodeExtensionAnnouncement;
