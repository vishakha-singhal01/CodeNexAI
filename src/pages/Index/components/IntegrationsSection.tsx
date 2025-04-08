import React from 'react';
import { Card, CardContent } from "@/components/ui/card"; // Import Card
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar

export const IntegrationsSection = () => {
  return (
    <section className="w-full py-20 md:py-28 bg-muted/50">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Powerful Integrations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
           Connect with your existing tools and workflows.
          </p>
        </div>
        {/* Use Card and Avatar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6"> {/* Adjusted gap */}
          {["GitHub", "GitLab", "Swagger", "OpenAPI", "Postman", "Docusaurus"].map((integration) => (
            <Card key={integration} className="bg-background/50 hover:bg-background/80 transition-colors duration-200 shadow-sm border">
              <CardContent className="flex flex-col items-center p-6 gap-3"> {/* Adjusted padding and gap */}
                <Avatar className="h-16 w-16 border"> {/* Increased size */}
                  {/* Placeholder - Replace with actual logos using AvatarImage */}
                  <AvatarFallback className="text-xl font-semibold bg-muted/50">
                    {integration.slice(0, 2)} {/* Show first 2 chars */}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-center text-sm">{integration}</span> {/* Adjusted text size */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
