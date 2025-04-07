
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Code, FileText, GitBranch, Zap, Server, AlertCircle, Upload, Download, Github } from "lucide-react"; // Add Github icon
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Import Input for file input styling
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Index = () => {
  const [backendStatus, setBackendStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>(''); // State for repo URL
  const [generatedDocs, setGeneratedDocs] = useState<string>('');
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch('/api/health'); // Uses the proxy
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBackendStatus({ message: data.message || 'Connected', error: false });
      } catch (error) {
        console.error("Failed to fetch backend status:", error);
        setBackendStatus({ message: 'Failed to connect to backend.', error: true });
      }
    };

    fetchBackendStatus();
  }, []);

  const clearInputs = () => {
    setInputCode('');
    setUploadedFiles(null);
    setRepoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Generic function to handle API call and state updates
  const generateDocsApiCall = async (endpoint: string, body: any, headers?: HeadersInit) => {
    setIsLoadingDocs(true);
    setGeneratedDocs('');
    setDocsError(null);
    clearInputs(); // Clear other inputs when starting a new generation type

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
      setGeneratedDocs(data.documentation);
    } catch (error: any) {
      console.error(`Failed to generate documentation from ${endpoint}:`, error);
      setDocsError(error.message || "An unknown error occurred.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Handler for pasting code
  const handleGenerateDocsFromText = () => {
    if (!inputCode.trim()) {
      setDocsError("Please enter some code to document.");
      return;
    }
    setRepoUrl(''); // Clear repo URL if text is used
    generateDocsApiCall('/api/generate-docs', JSON.stringify({ code: inputCode }), { 'Content-Type': 'application/json' });
  };

  // Handler for file uploads
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedFiles(event.target.files);
    setInputCode(''); // Clear other inputs
    setRepoUrl('');
    setGeneratedDocs('');
    setDocsError(null);
  };

  const handleGenerateDocsFromUpload = () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      setDocsError("Please select files or a folder to upload.");
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('codeFiles', uploadedFiles[i]);
    }
    generateDocsApiCall('/api/upload-generate-docs', formData); // Let browser set Content-Type
  };

   // Handler for GitHub Repo URL
   const handleGenerateDocsFromRepo = () => {
    if (!repoUrl.trim() || !isValidGitHubUrl(repoUrl)) { // Add validation
      setDocsError("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo).");
      return;
    }
    setInputCode(''); // Clear other inputs
    setUploadedFiles(null);
    generateDocsApiCall('/api/github-repo-docs', JSON.stringify({ repoUrl: repoUrl }), { 'Content-Type': 'application/json' });
  };

  // Basic client-side validation for GitHub URL (can be improved)
  const isValidGitHubUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'github.com' && parsed.pathname.split('/').filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  };

  // Handler for downloading docs
  const handleDownloadDocs = () => {
    if (!generatedDocs) return;
    const blob = new Blob([generatedDocs], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-documentation.md'; // Filename for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      {/* Backend Status Indicator */}
      {backendStatus && (
        <Alert variant={backendStatus.error ? "destructive" : "default"} className="container max-w-5xl mx-auto mt-4 mb-2 rounded-lg border">
          {backendStatus.error ? <AlertCircle className="h-4 w-4" /> : <Server className="h-4 w-4" />}
          <AlertTitle className="font-semibold">{backendStatus.error ? "Backend Connection Error" : "Backend Status"}</AlertTitle>
          <AlertDescription>
            {backendStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
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
            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
              Request Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
              Book a demo
            </Button>
          </div>
           {/* Simplified placeholder graphic */}
          <div className="relative w-full max-w-4xl aspect-video rounded-lg border bg-muted/50 overflow-hidden mt-12 shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center p-8">
               {/* Placeholder: Could be an abstract graphic or animation */}
              <div className="flex items-center gap-4 text-muted-foreground">
                 <Code className="h-16 w-16 opacity-50" />
                 <ArrowRight className="h-8 w-8 opacity-30" />
                 <FileText className="h-16 w-16 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Generator Section */}
      <section id="try-it" className="w-full py-20 md:py-28 lg:py-32 bg-background border-t">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Try the AI Generator</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste code, upload files, or link a public GitHub repo.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto shadow-lg border">
            <CardContent className="p-6">
              <Tabs defaultValue="paste" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6"> {/* Increased bottom margin */}
                  <TabsTrigger value="paste">Paste Code</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="github">GitHub Repo</TabsTrigger> {/* Added GitHub Tab */}
            </TabsList>

            {/* Paste Code Tab */}
            <TabsContent value="paste">
              <div className="grid gap-5"> {/* Increased gap */}
                <div>
                  {/* <Label htmlFor="code-input">Code Input</Label> */}
                  <Textarea
                    id="code-input"
                    placeholder="Paste your function, class, or code snippet here..."
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setUploadedFiles(null); setRepoUrl(''); setGeneratedDocs(''); setDocsError(null);
                    }}
                    className="min-h-[250px] font-mono text-sm bg-muted/30 border rounded-md focus-visible:ring-primary focus-visible:ring-offset-0" // Added background, rounded, focus style
                    disabled={isLoadingDocs}
                  />
                </div>
                <Button size="lg" onClick={handleGenerateDocsFromText} disabled={isLoadingDocs || !inputCode.trim()}>
                  {isLoadingDocs ? "Generating..." : "Generate from Text"}
                </Button>
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <div className="grid gap-5"> {/* Increased gap */}
                <div className="space-y-2">
                  {/* <Label htmlFor="file-input">Upload Files or Folder</Label> */}
                  <Input
                    id="file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    // @ts-ignore - webkitdirectory is non-standard but widely supported
                    webkitdirectory="true"
                    directory="true"
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium hover:file:bg-accent hover:file:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-11" // Improved styling
                    disabled={isLoadingDocs}
                  />
                   <p className="text-sm text-muted-foreground pt-1">
                    Select multiple files or a single folder containing code.
                  </p>
                  {uploadedFiles && uploadedFiles.length > 0 && (
                     <div className="mt-2 text-sm text-muted-foreground max-h-24 overflow-y-auto border rounded p-2 bg-muted/30">
                       <strong>Selected {uploadedFiles.length} item(s):</strong> {Array.from(uploadedFiles).map(f => f.name).join(', ')}
                     </div>
                   )}
                </div>
                <Button size="lg" onClick={handleGenerateDocsFromUpload} disabled={isLoadingDocs || !uploadedFiles || uploadedFiles.length === 0}>
                   {isLoadingDocs ? "Generating..." : <> <Upload className="mr-2 h-4 w-4" /> Generate from Upload </>}
                </Button>
              </div>
            </TabsContent>

             {/* GitHub Repo Tab */}
            <TabsContent value="github">
              <div className="grid gap-5"> {/* Increased gap */}
                <div className="space-y-2">
                  {/* <Label htmlFor="repo-url-input">Public GitHub Repository URL</Label> */}
                  <Input
                    id="repo-url-input"
                    placeholder="https://github.com/username/repository-name"
                    value={repoUrl}
                     onChange={(e) => {
                      setRepoUrl(e.target.value);
                      setInputCode(''); setUploadedFiles(null); setGeneratedDocs(''); setDocsError(null);
                    }}
                    className="font-mono text-sm h-11" // Increased height
                    disabled={isLoadingDocs}
                  />
                   <p className="text-sm text-muted-foreground pt-1">
                    Enter the full URL of a public GitHub repository.
                  </p>
                </div>
                <Button size="lg" onClick={handleGenerateDocsFromRepo} disabled={isLoadingDocs || !repoUrl.trim() || !isValidGitHubUrl(repoUrl)}>
                  {isLoadingDocs ? "Generating..." : <> <Github className="mr-2 h-4 w-4" /> Generate from Repo </>}
                </Button>
              </div>
            </TabsContent>
           </Tabs>
          </CardContent>
         </Card>


          {/* Shared Output Area - Placed outside the Card for better separation */}
          <div className="mt-8 max-w-4xl mx-auto w-full">
            {docsError && (
              <Alert variant="destructive" className="mb-6"> {/* Increased margin */}
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Error</AlertTitle>
                <AlertDescription>{docsError}</AlertDescription>
              </Alert>
            )}
            {generatedDocs && (
              <Card className="shadow-md border">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5"> {/* Adjusted padding */}
                  <CardTitle className="text-xl font-semibold">Generated Documentation</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleDownloadDocs}>
                    <Download className="mr-2 h-4 w-4" />
                    Download (.md)
                  </Button>
                </CardHeader>
                <CardContent className="px-5 pb-5"> {/* Adjusted padding */}
                   {/* Added max-height and scroll */}
                  <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 p-4 rounded-md border max-h-[60vh] overflow-y-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedDocs}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Problem Section - Simplified for brevity, can be expanded */}
      <section className="w-full py-20 md:py-28 bg-muted/50 border-t">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Documentation Problem</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Documentation is often outdated, inconsistent, or missing entirely. This leads to:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Example Card - Repeat or modify for others */}
            <Card className="bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Slow Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  New team members spend weeks figuring out how systems work instead of delivering value.
                </p>
              </CardContent>
            </Card>
             <Card className="bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Knowledge Silos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Developers constantly interrupt each other to ask about APIs, modules, and implementation details.
                </p>
              </CardContent>
            </Card>
             <Card className="bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Bugs & Misuse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Poor documentation leads to misunderstanding code behavior, causing bugs and production issues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-28">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform analyzes your codebase to generate comprehensive documentation that stays in sync with your code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Codebase Analysis</CardTitle>
                <CardDescription className="text-md">
                  Scans your entire codebase to understand structure and relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Python, JavaScript, TypeScript, Java, and more</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Function signatures and class hierarchies</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Comments and existing documentation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>LLM-Powered Generator</CardTitle>
                <CardDescription className="text-md">
                  Uses advanced AI to create comprehensive documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Explains function and class purposes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Creates API endpoint documentation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Adds examples and usage patterns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Auto Update Engine</CardTitle>
                <CardDescription className="text-md">
                  Keeps documentation in sync with code changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Monitors GitHub/GitLab PRs</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Regenerates docs for changed code</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Creates "Doc diff" for review</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
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

      {/* Pricing Section */}
      <section className="w-full py-20 md:py-28">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pick the plan that fits your team's needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Up to 1 repository</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Maximum 100 files</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Basic API documentation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Community support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Get Started</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary shadow-xl relative bg-gradient-to-br from-background to-primary/10 scale-105">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground ml-1">/month per dev</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Unlimited repositories</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Advanced API documentation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Code examples generation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>All integrations included</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Free Trial</Button>
              </CardFooter>
            </Card>
            <Card className="bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>SSO & advanced security</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>On-premise deployment option</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Dedicated support manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
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
    </div>
  );
};


export default Index;
