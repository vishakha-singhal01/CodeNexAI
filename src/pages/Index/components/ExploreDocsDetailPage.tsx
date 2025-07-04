import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowLeft,
    Clock,
    Calendar,
    Github,
    ExternalLink,
    User,
    FileText,
    Sparkles,
    Zap,
    CheckCircle,
    Code,
    Eye,
    Link,
} from "lucide-react"
import { RepoDoc } from "./data"

interface DocDetailProps {
    doc: RepoDoc
}

export default function DocDetail({ doc }: DocDetailProps) {
    const [showPdf, setShowPdf] = useState(false)
    const slugifiedName = doc.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
    console.log(slugifiedName)
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative">
                {/* Header */}
                <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <Link href="/">
                                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Library
                                </Button>
                            </Link>

                            {/* <div className="flex items-center gap-4">
                                <Button variant={showPdf ? "secondary" : "default"} onClick={() => setShowPdf(false)} className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Documentation
                                </Button>
                                <Button variant={showPdf ? "default" : "secondary"} onClick={() => setShowPdf(true)} className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    View PDF
                                </Button>
                            </div> */}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-6xl mx-auto px-4 py-12">
                    {!showPdf ? (
                        // Blog-style documentation
                        <article className="max-w-4xl mx-auto">
                            {/* Hero section */}
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-white/80 text-sm font-medium">
                                    <Sparkles className="w-4 h-4" />
                                    AI-Generated Documentation
                                </div>

                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                        <img src={"/placeholder.svg"} alt={doc.name} className="w-12 h-12 object-contain" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-5xl font-black text-white mb-2">{doc.name}</h1>
                                        <div className="flex items-center gap-4 text-white/60">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>{doc.author}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{doc.readTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{doc.lastUpdated}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">{doc.fullDescription}</p>

                                <div className="flex flex-wrap justify-center gap-2 mt-6">
                                    {doc.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors px-3 py-1"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Stats cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">{doc.generationTime}s</div>
                                        <div className="text-white/60 text-sm">Generation Time</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Github className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">GitHub</div>
                                        <div className="text-white/80 text-sm">Source Repository</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">AI-Powered</div>
                                        <div className="text-white/80 text-sm">Documentation</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Features section */}
                            <section className="mb-16">
                                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                    Key Features
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {doc.features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                                            <span className="text-white/80">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Tech stack section */}
                            {/* <section className="mb-16">
                                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Code className="w-8 h-8 text-blue-400" />
                                    Technology Stack
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {doc.techStack.map((tech, index) => (
                                        <Badge
                                            key={index}
                                            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-white/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-colors px-4 py-2 text-sm"
                                        >
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>
                            </section> */}

                            {/* Source info */}
                            <section className="mb-16">
                                <Card className="bg-black backdrop-blur-md border border-white/20">
                                    <CardContent className="p-8">
                                        <h3 className="text-2xl font-bold text-white mb-4">Source Repository</h3>

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <p className="text-white/70 mb-2">
                                                    This documentation was generated from the official repository:
                                                </p>
                                                <p className="text-purple-300 font-mono text-lg break-all">{doc.sourceName}</p>
                                            </div>

                                            <Button
                                                asChild
                                                className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                            >
                                                <a
                                                    href={doc.sourceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    <Github className="w-4 h-4" />
                                                    View on GitHub
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* CTA to view PDF */}
                            <section className="text-center">
                                <section className="text-center">
                                    <div className="w-full bg-white overflow-hidden rounded-lg border border-white/10">
                                        <iframe
                                            src={`/docs/CodeNexAI-${slugifiedName}-Documentation.html`}
                                            className="w-full h-[800px] border-0"
                                            title={`${doc.name} Documentation Inline Preview`}
                                        />
                                    </div>
                                </section>
                            </section>
                        </article>
                    ) : (
                        // PDF viewer section
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-white mb-4">{doc.name} - Complete Documentation</h2>
                                <p className="text-white/70 text-lg">Full technical documentation and specifications</p>
                            </div>

                            <Card className="bg-white backdrop-blur-md border border-white/20 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className=" w-full">
                                        <iframe
                                            src={`/docs/CodeNexAI-${slugifiedName}-Documentation.html`}
                                            className="w-full h-[800px] border-0"
                                            title={`${doc.name} Documentation Inline Preview`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="text-center mt-8">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                >
                                    <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Open in New Tab
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
