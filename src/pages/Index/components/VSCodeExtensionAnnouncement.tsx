import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, UserPlus, MousePointer, Zap, Star, ArrowRight, ListTree } from "lucide-react"

const VSCodeExtensionAnnouncement: React.FC = () => {
  const steps = [
    {
      icon: <Download className="h-6 w-6" />,
      title: "Install Extension",
      description: "Get our extension from the VS Code Marketplace.",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Sign Up & Verify",
      description: "Create an account at codenexai.com and verify your email.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: <MousePointer className="h-6 w-6" />,
      title: "Select Code",
      description: "Highlight the code snippet you want to document in your editor.",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Right-Click & choose",
      description: 'Right-click and choose "CodenexAI: Generate Documentation".',
      color: "from-red-500 to-pink-600",
    },
    {
      icon: <ListTree className="h-6 w-6" />,
      title: "Select Doc Type",
      description: "Choose what kind of documentation you'd like to generate for your code.",
      color: "from-purple-500 to-violet-600",
    }
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            New Release
          </Badge>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
            Supercharge Your Workflow
          </h2>

          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-slate-600 dark:text-slate-300 leading-relaxed">
            Generate code documentation instantly, right within your editor.
            <span className="font-semibold text-blue-600 dark:text-blue-400"> Boost productivity</span> and
            <span className="font-semibold text-indigo-600 dark:text-indigo-400"> maintain clarity</span> with
            CodeNexAI.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              onClick={() =>
                window.open(
                  "https://marketplace.visualstudio.com/items/?itemName=CodeNexAI.codenexai-documentation",
                  "_blank",
                )
              }
            >
              <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Install from Marketplace
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Free to install
            </div>
          </div>
        </div>

        {/* Preview Image */}
        <div className="flex justify-center mb-20">
          <div className="relative w-full max-w-4xl aspect-video rounded-lg border bg-muted/50 overflow-hidden mt-12 shadow-lg">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/A0UPQfUDkQ4?si=I7rJhtBF5Z-GPhIb"
            title="How to use CodeNexAI VS Code Extension"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        </div>

        {/* How to Get Started */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">How to Get Started</h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Follow these simple steps to start generating documentation in minutes
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-slate-100 dark:border-slate-700"
            >
              {/* Step number */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
              </div>

              {/* Icon with gradient background */}
              <div
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {step.icon}
              </div>

              <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {step.title}
              </h4>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>

              {/* Connecting line for larger screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Available now on the Visual Studio Code Marketplace
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VSCodeExtensionAnnouncement
