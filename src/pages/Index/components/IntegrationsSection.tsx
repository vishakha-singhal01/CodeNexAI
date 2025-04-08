import React from 'react';

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {["GitHub", "GitLab", "Swagger", "OpenAPI", "Postman", "Docusaurus"].map((integration) => (
            <div key={integration} className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-background border shadow-sm flex items-center justify-center mb-4 transition-transform hover:scale-105">
                {/* Placeholder - Replace with actual logos */}
                <span className="text-2xl font-bold text-muted-foreground/70">{integration.charAt(0)}</span>
              </div>
              <span className="font-medium text-muted-foreground">{integration}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
