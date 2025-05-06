import React, { useEffect, useState } from 'react';
import { AlertCircle, Upload, Download, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react"; // Added for dropdown indicator
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext'; // Import useAuth

interface GeneratorSectionProps {
  inputCode: string;
  setInputCode: (value: string) => void;
  uploadedFiles: FileList | null;
  setUploadedFiles: (files: FileList | null) => void;
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  generatedDocs: string;
  setGeneratedDocs: (docs: string) => void;
  isLoadingDocs: boolean;
  docsError: string | null;
  setDocsError: (error: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleGenerateDocsFromText: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateDocsFromUpload: () => void;
  handleGenerateDocsFromRepo: () => void;
  isValidGitHubUrl: (url: string) => boolean;
  handleDownloadDocs: () => void;
  clearInputs: () => void; // Add clearInputs prop
}

export const GeneratorSection: React.FC<GeneratorSectionProps> = ({
  inputCode,
  setInputCode,
  uploadedFiles,
  setUploadedFiles, // Pass this down
  repoUrl,
  setRepoUrl,
  generatedDocs,
  setGeneratedDocs, // Pass this down
  isLoadingDocs,
  docsError,
  setDocsError, // Pass this down
  fileInputRef,
  handleGenerateDocsFromText,
  handleFileChange,
  handleGenerateDocsFromUpload,
  handleGenerateDocsFromRepo,
  isValidGitHubUrl,
  handleDownloadDocs,
  clearInputs, // Destructure clearInputs
}) => {
  const { user } = useAuth(); // Get user from AuthContext
  const userPlan = user?.plan || 'free'; // Default to 'free' if no user or plan
  const [selectedTab, setSelectedTab] = useState("paste"); // State for active tab

  const tabOptions = [
    { value: "paste", label: "Paste Code", disabled: false, badge: null },
    { value: "upload", label: "Upload", disabled: userPlan === 'free', badge: userPlan === 'free' ? "Pro+" : null },
    { value: "github", label: "GitHub Repo", disabled: userPlan === 'free' || userPlan === 'pro', badge: (userPlan === 'free' || userPlan === 'pro') ? "Enterprise" : null },
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === selectedTab)?.label || "Select Option";

  const handleDownloadPDF = () => {
    const preview = document.getElementById('markdown-preview');
    if (!preview) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Generated Documentation</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; }
            .prose { max-width: 100%; }
          </style>
        </head>
        <body>
          ${preview.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const loadingQuotes = [
    "Good things take time. Great code takes a bit longer.",
    "While we crunch the numbers, grab a coffee ☕",
    "Just a few moments away from brilliance!",
    "Patience is a developer's superpower.",
    "Behind the scenes, code magic is happening... 🔮",
    "Innovation loading... please stand by.",
    "Documentation is being summoned 📜✨",
    "Hold tight! Your code is getting smarter.",
  ];

  const [loadingQuote, setLoadingQuote] = useState("");
  const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
  useEffect(() => {
    if (isLoadingDocs) {
      setLoadingQuote(loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]);
    }
  }, [isLoadingDocs]);

  // Handler for tab changes
  const handleTabChangeInternal = (newTabValue: string) => {
    setSelectedTab(newTabValue);
    clearInputs(); // Clear all input fields from parent
    setGeneratedDocs(''); // Clear generated docs
    setDocsError(null); // Clear any errors
  };

  return (
    // Added id="generator-section" here
    <section id="generator-section" className="w-full py-20 md:py-28 lg:py-32 bg-background border-t">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Try the AI Generator</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste code, upload files, or link a public GitHub repo. (Feature access depends on your plan)
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              'JavaScript', 'TypeScript', 'JSX', 'TSX', 'Python', 'Java', 'C', 'C++', 'C#',
              'HTML', 'CSS', 'SCSS', 'LESS', 'JSON', 'Markdown', 'Text',
              'Shell', 'Ruby', 'Go', 'PHP'
            ].map(lang => (
              <span key={lang} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                {lang}
              </span>
            ))}
          </div>
        </div>

        <Card className="max-w-4xl mx-auto shadow-md border rounded-2xl bg-card"> {/* Changed bg-white to bg-card */}
          <CardContent className="p-8 space-y-6">
            <Tabs value={selectedTab} onValueChange={handleTabChangeInternal} className="w-full">
              {/* Desktop TabsList */}
              <TabsList className="hidden w-full md:grid md:grid-cols-3 gap-2 bg-muted/40 p-1 rounded-lg mb-6">
                {tabOptions.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-md data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm"
                    disabled={tab.disabled}
                  >
                    {tab.label} {tab.badge && <Badge variant="secondary" className="ml-2">{tab.badge}</Badge>}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Mobile Dropdown */}
              <div className="md:hidden mb-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {currentTabLabel}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width)]">
                    {tabOptions.map(tab => (
                      <DropdownMenuItem
                        key={tab.value}
                        disabled={tab.disabled}
                        onSelect={() => handleTabChangeInternal(tab.value)}
                        className={selectedTab === tab.value ? "bg-muted" : ""}
                      >
                        {tab.label} {tab.badge && <Badge variant="secondary" className="ml-2">{tab.badge}</Badge>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Paste Code Tab */}
              <TabsContent value="paste">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code-input" className="text-base font-medium">Paste Code</Label>
                    <Textarea
                      id="code-input"
                      placeholder="Paste your function, class, or code snippet here..."
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value);
                        // Keep clearing other inputs on change within a tab
                        setUploadedFiles(null); setRepoUrl(''); setGeneratedDocs(''); setDocsError(null);
                      }}
                      className="min-h-[250px] font-mono text-sm bg-muted/30 border border-border rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={isLoadingDocs}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGenerateDocsFromText}
                    disabled={isLoadingDocs || !inputCode.trim()}
                  >
                    {isLoadingDocs ? "Generating..." : "Generate from Text"}
                  </Button>
                </div>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="file-input" className="text-base font-medium">Upload Folder</Label>
                    <Input
                      id="file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange} // handleFileChange already clears other inputs
                      multiple
                      // @ts-expect-error // Use ts-expect-error instead of ts-ignore
                      webkitdirectory="true"
                      directory="true"
                      className="cursor-pointer h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:bg-background file:text-sm file:font-medium hover:file:bg-accent hover:file:text-accent-foreground focus-visible:ring-2"
                      disabled={isLoadingDocs || userPlan === 'free'} // Also disable input if free
                    />
                    <p className="text-sm text-muted-foreground pt-1">
                      Select folder containing code. (Available for Pro and Enterprise plans)
                    </p>

                    {uploadedFiles && uploadedFiles.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto rounded-md p-3 border bg-muted/20">
                        <p className="text-sm font-medium mb-2">Selected {uploadedFiles.length} item(s):</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(uploadedFiles).map((file, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGenerateDocsFromUpload}
                    disabled={isLoadingDocs || !uploadedFiles || uploadedFiles.length === 0 || userPlan === 'free'} // Disable button for free users
                  >
                    {isLoadingDocs ? "Generating..." : <> <Upload className="mr-2 h-4 w-4" /> Generate from Upload </>}
                  </Button>
                </div>
              </TabsContent>

              {/* GitHub Repo Tab */}
              <TabsContent value="github">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="repo-url-input" className="text-base font-medium">Public GitHub Repository URL</Label>
                    <Input
                      id="repo-url-input"
                      placeholder="https://github.com/username/repository-name"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value);
                        // Keep clearing other inputs on change within a tab
                        setInputCode(''); setUploadedFiles(null); setGeneratedDocs(''); setDocsError(null);
                      }}
                      className="font-mono text-sm h-11 rounded-md"
                      disabled={isLoadingDocs || userPlan === 'free' || userPlan === 'pro'} // Also disable input if free/pro
                    />
                    <p className="text-sm text-muted-foreground pt-1">
                      Enter the full URL of a public GitHub repository. (Available for Enterprise plan)
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGenerateDocsFromRepo}
                    disabled={isLoadingDocs || !repoUrl.trim() || !isValidGitHubUrl(repoUrl) || userPlan === 'free' || userPlan === 'pro'} // Disable button for free/pro users
                  >
                    {isLoadingDocs ? "Generating..." : <> <Github className="mr-2 h-4 w-4" /> Generate from Repo </>}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 max-w-4xl mx-auto w-full">
          {isLoadingDocs ? (
            <div className="flex justify-center items-center mb-8 min-h-[80px]">
              <div className="relative overflow-hidden">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-muted-foreground animate-pulse">
                  {loadingQuote}
                </h3>
                {/* Changed shimmer color for better dark mode compatibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-shimmer" />
              </div>
            </div>
          ) : (
            <>
              {docsError && (
                <Alert variant="destructive" className="mb-6"> {/* Increased margin */}
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Generation Error</AlertTitle>
                  <AlertDescription>{docsError}</AlertDescription>
                </Alert>
              )}
              {generatedDocs && (
                <Card className="max-w-4xl mx-auto shadow-md border rounded-2xl bg-card"> {/* Changed bg-white to bg-card */}
                  <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5">
                    <CardTitle className="text-xl font-semibold">Generated Documentation</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownloadDocs}>
                          Download as <span className="ml-1 font-medium">.md</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadPDF}>
                          Download as <span className="ml-1 font-medium">PDF</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                      <div className="bg-muted/20 p-4 rounded-md border overflow-y-auto whitespace-pre-wrap text-sm font-mono max-h-[60vh]">
                        {generatedDocs}
                      </div>

                      <div id="markdown-preview" className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 p-4 rounded-md border overflow-y-auto max-h-[60vh]
                      [&_p]:mb-4
                      [&_h1]:mb-6 [&_h2]:mb-5 [&_h3]:mb-4
                      [&_ul]:mb-4 [&_ol]:mb-4
                      [&_li]:mb-2
                      [&_pre]:my-4
                      [&_blockquote]:my-4
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedDocs}</ReactMarkdown>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
