import React, { useEffect, useState, useCallback } from 'react';
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

interface ExtendedUser {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  googleId?: string;
  githubId?: string;
  plan: 'free' | 'pro' | 'enterprise';
  accessToken?: string;
}

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
  isValidGitHubUrl: (url: string) => boolean;
  handleDownloadDocs: () => void;
  clearInputs: () => void;
}

export const GeneratorSection: React.FC<GeneratorSectionProps> = ({
  inputCode,
  setInputCode,
  uploadedFiles,
  setUploadedFiles,
  repoUrl,
  setRepoUrl,
  generatedDocs,
  setGeneratedDocs,
  isLoadingDocs,
  docsError,
  setDocsError,
  fileInputRef,
  handleFileChange,
  handleGenerateDocsFromUpload,
  isValidGitHubUrl,
  handleDownloadDocs,
  clearInputs,
}) => {
  const { user } = useAuth();
  const userPlan = user?.plan || "free";
  const [selectedTab, setSelectedTab] = useState("paste");
  const [loadingQuote, setLoadingQuote] = useState("");
  const [isLoadingDocsInternal, setIsLoadingDocsInternal] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("API Documentation");

  const docTypeOptions = [
    "API Documentation",
    "Codebase Documentation",
    "Tutorials/Guides",
    "Conceptual Overviews",
  ];

  const tabOptions = [
    { value: "paste", label: "Paste Code", disabled: false, badge: null },
    { value: "upload", label: "Upload", disabled: userPlan === 'free', badge: userPlan === 'free' ? "Pro+" : null },
    { value: "github", label: "GitHub Repo", disabled: userPlan === 'free' || userPlan === 'pro', badge: (userPlan === 'free' || userPlan === 'pro') ? "Enterprise" : null },
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === selectedTab)?.label || "Select Option";

  const handleDownloadPDF = useCallback(() => {
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
  }, []);

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

  async function generateDocsApiCall(endpoint: string, body: string | FormData, customHeaders?: HeadersInit) {
    setIsLoadingDocsInternal(true);
    setGeneratedDocs("");
    setDocsError(null);

    let prompt = "";
    switch (selectedDocType) {
      case "API Documentation":
        prompt = `Generate comprehensive API documentation for the following code. Include details about each endpoint, its parameters, request and response formats, authentication methods, and example usage. Focus on providing clear and concise information for developers who want to integrate with this API.`;
        break;
      case "Codebase Documentation":
        prompt = `Generate detailed codebase documentation for the following code. Explain the purpose of each class, function, and module, as well as the relationships between them. Include information about data structures, algorithms, and design patterns used in the code. Focus on providing a clear understanding of the codebase for developers who want to maintain or extend it.`;
        break;
      case "Tutorials/Guides":
        prompt = `Generate step-by-step tutorials and guides for using the following code. Provide clear and concise instructions, code examples, and screenshots where appropriate. Focus on helping users learn how to use the code to accomplish specific tasks.`;
        break;
      case "Conceptual Overviews":
        prompt = `Generate high-level conceptual overviews of the following code. Explain the system's architecture, design principles, and key concepts. Focus on providing a clear understanding of the code for stakeholders who want to understand the big picture.`;
        break;
      default:
        prompt = `Generate documentation for the following code.`;
    }

    // Include the selected documentation type in the request body
    // The API endpoint should handle this parameter and generate documentation accordingly
    if (typeof body === "string") {
      const requestBody = JSON.parse(body);
      requestBody.docType = selectedDocType;
      requestBody.prompt = prompt; // Add the prompt to the request body
      body = JSON.stringify(requestBody);
    } else if (body instanceof FormData) {
      body.append("docType", selectedDocType);
      body.append("prompt", prompt);
    }

    const fullEndpoint = import.meta.env.PROD
      ? `${import.meta.env.VITE_API_BASE_URL}${endpoint}`
      : endpoint;

    const headers = new Headers(customHeaders); // Start with custom headers
    const token = (user as ExtendedUser)?.accessToken;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(fullEndpoint, {
        method: 'POST',
        headers: headers, // Use the combined headers
        body: body,
      });
      const data = await response.json();
      if (!response.ok) {
        // If the error is specifically "Not authorized, no token provided." and we *did* send a token,
        // it might mean the token is invalid/expired.
        if (data.message === 'Not authorized, no token provided.' && token) {
          setDocsError("Authentication error: Your session might have expired. Please try logging out and logging back in.");
        } else if (data.message === 'Not authorized, token failed verification.') {
          setDocsError("Authentication error: Your token is invalid. Please try logging out and logging back in.");
        }
        else {
          throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }
      }
      // Only set generated docs if response was ok and data.documentation exists
      if (response.ok && data.documentation) {
        setGeneratedDocs(data.documentation);
      } else if (response.ok && !data.documentation) {
        // Handle cases where response is ok but no documentation is returned (e.g. empty input)
        setDocsError("No documentation was generated. The input might have been empty or not processable.");
      }
      // If not response.ok, the error handling above should have set docsError.
    } catch (error: unknown) {
      console.error(`Failed to generate documentation from ${fullEndpoint}:`, error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Avoid overwriting specific auth errors if already set
      if (!docsError) {
        setDocsError(errorMessage);
      }
    } finally {
      setIsLoadingDocsInternal(false);
    }
  }

  const handleGenerateDocsFromText = () => {
    setDocsError(null);
    setGeneratedDocs('');
    generateDocsApiCall(
      "/api/generate-docs",
      JSON.stringify({ code: inputCode, docType: selectedDocType }),
      {
        "Content-Type": "application/json",
      }
    );
  };

  // Handler for GitHub Repo URL
  const handleGenerateDocsFromRepo = useCallback(async () => {
    if (!repoUrl.trim() || !isValidGitHubUrl(repoUrl)) {
      setDocsError("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo).");
      return;
    }
    setInputCode("");
    setUploadedFiles(null);
    await generateDocsApiCall(
      "/api/github-repo-docs",
      JSON.stringify({ repoUrl, githubToken }),
      {
        "Content-Type": "application/json",
      }
    );
  }, [generateDocsApiCall, isValidGitHubUrl, repoUrl, setDocsError, setInputCode, setUploadedFiles, githubToken, inputCode, selectedDocType]);

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

        <Card className="max-w-4xl mx-auto shadow-md border rounded-2xl bg-card">
          <CardContent className="p-8 space-y-6">
            <div className="mb-6">
              <Label htmlFor="doc-type-select" className="text-base font-medium">Documentation Type</Label>
              <select
                id="doc-type-select"
                className="w-full h-11 rounded-md border border-border bg-muted/30 text-sm font-mono focus-visible:ring-2 focus-visible:ring-primary"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                disabled={isLoadingDocs}
              >
                {docTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <Tabs value={selectedTab} onValueChange={handleTabChangeInternal} className="w-full">
             
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
                    onClick={() => {
                      setDocsError(null);
                      setGeneratedDocs('');
                      generateDocsApiCall(
                        "/api/generate-docs",
                        JSON.stringify({ code: inputCode }),
                        {
                          "Content-Type": "application/json",
                        }
                      );
                    }}
                    disabled={isLoadingDocs}
                  >
                    {isLoadingDocs ? "Generating..." : "Generate from Text"}
                  </Button>
                </div>
              </TabsContent>

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
                    disabled={isLoadingDocs}
                  >
                    {isLoadingDocs ? "Generating..." : <> <Upload className="mr-2 h-4 w-4" /> Generate from Upload </>}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="github">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="repo-url-input" className="text-base font-medium">GitHub Repository URL</Label>
                    <Input
                      id="repo-url-input"
                      placeholder="https://github.com/username/repository-name"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value);
                        setInputCode(''); setUploadedFiles(null); setGeneratedDocs(''); setDocsError(null);
                      }}
                      className="font-mono text-sm h-11 rounded-md"
                      disabled={isLoadingDocs || userPlan === 'free' || userPlan === 'pro'} // Also disable input if free/pro
                    />
                    <p className="text-sm text-muted-foreground pt-1">
                      Enter the full URL of a GitHub repository. (Available for Enterprise plan)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-token-input" className="text-base font-medium">
                      GitHub Token<span className="text-muted-foreground">(Optional for public repos, required for private)</span>
                    </Label>
                    <Input
                      id="github-token-input"
                      type="password"
                      placeholder="Enter your GitHub token"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="font-mono text-sm h-11 rounded-md"
                      disabled={isLoadingDocs}
                    />
                    <p className="text-sm text-muted-foreground pt-1">
                      Enter your GitHub token to access private repositories.
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1 pt-2">
                      <p className="font-medium">Steps to get a GitHub Token:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">GitHub Developer Settings</a>.</li>
                        <li>Click on <strong>"Generate new token"</strong> (or <strong>"Fine-grained token"</strong> for more control).</li>
                        <li>Set a name and expiration date for your token.</li>
                        <li>Select the scopes/permissions you need (e.g., <code>repo</code> to access private repositories).</li>
                        <li>Click <strong>"Generate token"</strong> at the bottom.</li>
                        <li>Copy and paste the token here. You won’t be able to view it again later.</li>
                      </ol>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGenerateDocsFromRepo}
                    disabled={isLoadingDocs || !repoUrl.trim() || !isValidGitHubUrl(repoUrl) || userPlan === 'free' || userPlan === 'pro'}
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-shimmer" />
              </div>
            </div>
          ) : (
            <>
              {docsError && (
                <Alert variant="destructive" className="mb-6"> 
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Generation Error</AlertTitle>
                  <AlertDescription>{docsError}</AlertDescription>
                </Alert>
              )}
              {generatedDocs && (
                <Card className="max-w-4xl mx-auto shadow-md border rounded-2xl bg-card"> 
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
                      [&_ul]:mb-4
                      [&_ol]:mb-4
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
