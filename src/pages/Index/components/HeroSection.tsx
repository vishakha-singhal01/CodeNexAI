"use client"
import { ArrowRight, Code, FileText, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import documentImage from "../../../assets/documents-sample.png"

export const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-2000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative container px-4 md:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-800/50 mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Available on VS Code for Developers</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl leading-[1.1] mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200">
            AI-Powered Documentation
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            That Writes Itself
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
          Stop wasting time on manual documentation. Let AI analyze your codebase and generate comprehensive docs.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <Code className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Code Analysis</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium">Auto-Generated</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
          <Button
            size="lg"
            className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate("/contact")}
          >
            Book a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 text-base font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              const generatorSection = document.getElementById("generator-section")
              generatorSection?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Try the Generator
          </Button>
        </div>

        {/* Hero Image */}
        <div className="relative group max-w-5xl w-full">
          {/* Glow Effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Image Container */}
          <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/30">
            <img
              src={documentImage || "/placeholder.svg"}
              alt="AI-Generated Documentation Samples"
              className="relative w-full rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-[1.02] transition-transform duration-500"
            />

            <div className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 animate-bounce">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 animate-bounce delay-500">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 animate-bounce delay-1000">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
