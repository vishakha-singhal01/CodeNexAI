import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import {
  Upload, Github, Download, AlertCircle, ChevronDown, FileText, BookOpen, Layers, ListTree, Activity, GitBranch, Code
} from 'lucide-react';

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
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedDiagramType, setSelectedDiagramType] = useState<string[]>([]);

  const docTypeOptions = [
    "API Documentation",
    "Codebase Documentation",
    "Tutorials/Guides",
    "Conceptual Overviews",
    "Sequence Diagram",
    "UML Diagram",
    "Flowchart"
  ];

  const docTypeIconMap: Record<string, JSX.Element> = {
    'API Documentation': <FileText className="h-6 w-6 text-blue-600" />,
    'Codebase Documentation': <BookOpen className="h-6 w-6 text-indigo-600" />,
    'Tutorials/Guides': <Layers className="h-6 w-6 text-purple-600" />,
    'Conceptual Overviews': <ListTree className="h-6 w-6 text-pink-600" />,
    'Sequence Diagram': <Activity className="h-6 w-6 text-orange-600" />,
    'UML Diagram': <GitBranch className="h-6 w-6 text-green-600" />,
    'Flowchart': <Code className="h-6 w-6 text-yellow-600" />,
  };

  const docTypeDescriptionMap: Record<string, string> = {
    'API Documentation': 'Structured documentation for APIs, including endpoints, methods, and parameters.',
    'Codebase Documentation': 'Internal explanation of code structure, files, and logic for developers.',
    'Tutorials/Guides': 'Step-by-step instructions or how-to content for specific tasks or features.',
    'Conceptual Overviews': 'High-level explanation of system architecture, ideas, and key concepts.',
    'Sequence Diagram': 'Visual representation of the order of operations or messages over time.',
    'UML Diagram': 'Unified Modeling Language diagrams for designing and analyzing software systems.',
    'Flowchart': 'Graphical representation of a process or workflow using symbols and arrows.',
  };

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
      <!DOCTYPE html>
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

      case "Sequence Diagram":
        prompt = `Analyze the following code and generate a detailed Sequence Diagram using Mermaid syntax.

- Show the chronological interaction between objects/components.
- Represent messages, method calls, and responses.
- Annotate lifelines and activation bars meaningfully.
- Include asynchronous and synchronous interactions.
- Provide brief notes on optimization and potential security risks.`;
        break;

      case "UML Diagram":
        prompt = `Analyze the following code and generate a UML Class Diagram using Mermaid syntax.

- Include classes/interfaces with attributes and methods.
- Show relationships like inheritance, composition, and dependencies.
- Annotate visibility modifiers if applicable.
- Provide notes on design improvements and security considerations.`;
        break;

      case "Flowchart":
        prompt = `Analyze the following code and create a Flowchart using Mermaid syntax.

- Represent the logic flow including decisions, loops, and processes.
- Clearly label nodes and transitions.
- Highlight critical paths and error handling branches.
- Provide suggestions for flow optimization and identify security risks.`;
        break;

      default:
        prompt = `Generate documentation for the following code.`;
    }

    let mappedDocType = "detailed";

    if (selectedDiagramType.length > 0) {
      mappedDocType = "diagrammatical";
    } else if (docTypeOptions.includes(selectedDocType)) {
      mappedDocType = selectedDocType;
    } else {
      mappedDocType = "detailed";
    }


    if (typeof body === "string") {
      const requestBody: any = JSON.parse(body);
      if (selectedDiagramType.length === 0) {
        requestBody.docType = mappedDocType;
        requestBody.prompt = prompt;
      }
      body = JSON.stringify(requestBody);
    } else if (body instanceof FormData) {
      if (selectedDiagramType.length === 0) {
        body.append("docType", mappedDocType);
        body.append("prompt", prompt);
      }
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
      JSON.stringify({ code: inputCode, docType: selectedDocType, diagramTypes: selectedDiagramType }),
      {
        "Content-Type": "application/json",
      }
    );
  };

  const handleGenerateDocsFromRepo = useCallback(async () => {
    if (!repoUrl.trim() || !isValidGitHubUrl(repoUrl)) {
      setDocsError("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo).");
      return;
    }
    setInputCode("");
    setUploadedFiles(null);
    await generateDocsApiCall(
      "/api/github-repo-docs",
      JSON.stringify({ repoUrl, githubToken, diagramTypes: selectedDiagramType }),
      {
        "Content-Type": "application/json",
      }
    );
  }, [generateDocsApiCall, isValidGitHubUrl, repoUrl, setDocsError, setInputCode, setUploadedFiles, githubToken, inputCode, selectedDocType, selectedDiagramType]);

  return (

    // Added id="generator-section" here
    <section
      id="generator-section"
      className="w-full py-20 md:py-28 lg:py-32 bg-background border-t"
    >
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">✨ Try the AI Generator</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Paste code, upload files, or link a public GitHub repo. <br className="hidden md:block" />
            <span className="text-sm text-primary/70">(Feature access depends on your plan)</span>
          </p>
        </div>

        {/* Supported Languages */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            "JavaScript",
            "TypeScript",
            "JSX",
            "TSX",
            "Python",
            "Java",
            "C",
            "C++",
            "C#",
            "HTML",
            "CSS",
            "SCSS",
            "LESS",
            "JSON",
            "Markdown",
            "Text",
            "Shell",
            "Ruby",
            "Go",
            "PHP",
          ].map((lang) => (
            <span
              key={lang}
              className="px-3 py-1 text-sm rounded-full bg-muted text-foreground border border-border shadow-sm"
            >
              {lang}
            </span>
          ))}
        </div>

        {!selectedDocType ? (
          // Doc Type Cards
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {docTypeOptions.map((type) => (
              <Card
                key={type}
                onClick={() => setSelectedDocType(type)}
                className="cursor-pointer hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col items-center justify-center text-center border border-gray-300 dark:border-gray-700"
              >
                <div className="mb-2">{docTypeIconMap[type]}</div>
                <div className="font-semibold text-lg">{type}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {docTypeDescriptionMap[type]}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Generator Section (replaces doc type cards)
          <div className="mb-16 p-6 border rounded-2xl bg-card shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Selected Doc Type:{" "}
                <Badge className="px-2 py-1 text-sm">{selectedDocType}</Badge>
              </h3>
              <Button variant="ghost" onClick={() => setSelectedDocType(null)}>
                🔄 Change Type
              </Button>
            </div>

            {/* <Card className="shadow-lg border rounded-2xl bg-card"> */}
            <CardContent className="p-8 space-y-6">
              <Tabs
                value={selectedTab}
                onValueChange={handleTabChangeInternal}
                className="w-full"
              >
                <TabsList className="hidden w-full md:grid md:grid-cols-3 gap-2 bg-muted/30 p-1 rounded-lg mb-6">
                  {tabOptions.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-lg text-sm py-2 px-3 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      disabled={tab.disabled}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Mobile Dropdown Tabs */}
                <div className="md:hidden mb-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {tabOptions.find((t) => t.value === selectedTab)?.label}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {tabOptions.map((tab) => (
                        <DropdownMenuItem
                          key={tab.value}
                          disabled={tab.disabled}
                          onSelect={() => handleTabChangeInternal(tab.value)}
                        >
                          {tab.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Paste Tab Content */}
                <TabsContent value="paste">
                  <div className="grid gap-4">
                    <Label htmlFor="code-input" className="text-base font-medium">
                      Paste your Code
                    </Label>
                    <Textarea
                      id="code-input"
                      placeholder="function helloWorld() { console.log('Hello!'); }"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value);
                        setUploadedFiles(null);
                        setRepoUrl("");
                        setGeneratedDocs("");
                        setDocsError(null);
                      }}
                      className="min-h-[200px] font-mono text-sm bg-muted/20 border border-border rounded-lg"
                    />
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setDocsError(null);
                        setGeneratedDocs("");
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
                      {isLoadingDocs ? "Generating..." : "⚡ Generate from Text"}
                    </Button>
                  </div>
                </TabsContent>

                {/* Upload Tab Content */}
                <TabsContent value="upload">
                  <div className="grid gap-4">
                    <Label htmlFor="file-input" className="text-base font-medium">
                      Upload Folder
                    </Label>
                    <Input
                      id="file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      webkitdirectory="true"
                      directory="true"
                      className="cursor-pointer h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:bg-background file:text-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      Only available on Pro & Enterprise plans
                    </p>

                    {uploadedFiles?.length > 0 && (
                      <div className="bg-muted/20 p-3 rounded-md border max-h-32 overflow-y-auto">
                        <p className="text-sm font-medium mb-2">Selected files:</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(uploadedFiles).map((file, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleGenerateDocsFromUpload}
                      disabled={!uploadedFiles || isLoadingDocs}
                    >
                      {isLoadingDocs ? "Generating..." : "⚡ Generate from Files"}
                    </Button>
                  </div>
                </TabsContent>

                {/* GitHub Tab Content */}
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

              {isLoadingDocs ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) :
                generatedDocs && (
                  <>
                    <div className="mt-6 p-4 bg-muted rounded-lg border border-border font-mono text-sm relative">
                      <div className="absolute top-4 right-4">
                        <Button
                          className="bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors shadow-sm"
                          size="sm"
                          onClick={handleDownloadDocs}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                      </div>

                      <div className="whitespace-pre-wrap pt-12">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                        >
                          {generatedDocs}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </>


                )}
              {docsError && (
                <div className="mt-6 text-red-600 font-semibold">{docsError}</div>
              )}
            </CardContent>
            {/* </Card> */}
          </div>
        )
        }
      </div >
    </section >

  );
};
