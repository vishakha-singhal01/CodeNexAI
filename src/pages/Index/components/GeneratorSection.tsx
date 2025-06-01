import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown, { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import "github-markdown-css/github-markdown.css";
import rehypeRaw from 'rehype-raw';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { Github, Download, ChevronDown, FileText, BookOpen, Layers, ListTree, Activity, GitBranch, Code } from 'lucide-react';
import { docTypeDescriptionMap, docTypeIconMap, docTypeOptions, quotes, tieredDocTypes } from './data';
import { cn } from '@/lib/utils';

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
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  isValidGitHubUrl,
  handleDownloadDocs,
  clearInputs,
}) => {
  const { user } = useAuth();
  const userPlan = user?.plan || "free";
  const [selectedTab, setSelectedTab] = useState("paste");
  const [selectedTierTab, setSelectedTierTab] = useState("free");
  const [isLoading, setIsLoading] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedDiagramType, setSelectedDiagramType] = useState<string[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w]+/g, '-') 
      .replace(/^-+|-+$/g, ''); 

  const renderers: Components = {
    h1: ({ children }) => {
      const id = slugify(children[0]?.toString() || '');
      return <h1 id={id} className="text-3xl font-bold mt-6 mb-4">{children}</h1>;
    },
    h2: ({ children }) => {
      const id = slugify(children[0]?.toString() || '');
      return <h2 id={id} className="text-2xl font-semibold mt-5 mb-3">{children}</h2>;
    },
    h3: ({ children }) => {
      const id = slugify(children[0]?.toString() || '');
      return <h3 id={id} className="text-xl font-medium mt-4 mb-2">{children}</h3>;
    },
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 underline" rel="noopener noreferrer">
        {children}
      </a>
    ),
    br: () => <br />,
        code({ node, inline, className, children, ...props }: any & { inline?: boolean }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={darcula}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    img({ src, alt, title, ...props }) {
      return (
        <img
          src={src}
          alt={alt}
          title={title}
          style={{ maxWidth: "100%", height: "auto", display: "block", margin: "1rem 0" }}
          {...props}
        />
      );
    },

    table({ children, ...props }) {
      return (
        <table
          className="table-auto border-collapse border border-gray-300 w-full"
          {...props}
        >
          {children}
        </table>
      );
    },

    thead({ children, ...props }) {
      return (
        <thead
          className="bg-gray-200"
          {...props}
        >
          {children}
        </thead>
      );
    },

    tbody({ children, ...props }) {
      return <tbody {...props}>{children}</tbody>;
    },

    tr({ children, ...props }) {
      return (
        <tr className="border border-gray-300" {...props}>
          {children}
        </tr>
      );
    },

    th({ children, ...props }) {
      return (
        <th
          className="border border-gray-300 px-4 py-2 text-left bg-gray-100"
          {...props}
        >
          {children}
        </th>
      );
    },

    td({ children, ...props }) {
      return (
        <td
          className="border border-gray-300 px-4 py-2"
          {...props}
        >
          {children}
        </td>
      );
    },
  };


  const handleTabChangeInternal = (newTabValue: string) => {
    setSelectedTab(newTabValue);
    clearInputs();
    setGeneratedDocs('');
    setDocsError(null);
  };

  const handleSelectType = (type: string) => {
    setSelectedDocType(type)
    setSelectedTab('paste');
    clearInputs();
    setGeneratedDocs('');
    setDocsError(null);
  }

  async function generateDocsApiCall(endpoint: string, body: string | FormData, customHeaders?: HeadersInit) {
    const token = (user as ExtendedUser)?.accessToken;
    if (!user) {
      setDocsError("Authentication required. Please log in to generate documentation.");
      return;
    }

    setIsLoading(true);
    setGeneratedDocs("");
    setDocsError(null);

    const prompt = "Provide a Code Document";

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

    const headers = new Headers(customHeaders);
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
      setIsLoading(false);
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

  const handleGenerateDocsFromUpload = () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      setDocsError("Please select files or a folder to upload.");
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('codeFiles', uploadedFiles[i]);
    }
    generateDocsApiCall('/api/upload-generate-docs', formData);
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
      JSON.stringify({ repoUrl, githubToken, docType: selectedDocType }),
      {
        "Content-Type": "application/json",
      }
    );
  }, [generateDocsApiCall, isValidGitHubUrl, repoUrl, setDocsError, setInputCode, setUploadedFiles, githubToken, inputCode, selectedDocType]);

  return (
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
          <div>
            <div className="flex space-x-4 mb-4 border-b border-gray-300 dark:border-gray-700">
              {(['free', 'pro', 'enterprise'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTierTab(tab)}
                  className={`py-2 px-4 font-semibold border-b-2 ${selectedTierTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-blue-400'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tieredDocTypes[selectedTierTab]?.map((type) => (
                <Card
                  key={type}
                  onClick={() => {
                    if (docTypeIconMap[type].enabled) {
                      handleSelectType(type);
                    }
                  }}
                  className={cn(
                    "transition-shadow duration-300 p-4 flex flex-col items-center justify-center text-center border border-gray-300 dark:border-gray-700",
                    docTypeIconMap[type].enabled
                      ? "cursor-pointer hover:shadow-xl"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="mb-2">{docTypeIconMap[type].icon}</div>
                  <div className="font-semibold text-lg">{type}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {docTypeDescriptionMap[type]}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-16 p-6 border rounded-2xl bg-card shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Selected Doc Type:{" "}
                <Badge className="px-2 py-1 text-sm">{selectedDocType}</Badge>
              </h3>
              <Button variant="ghost" disabled={!!isLoading} onClick={() => setSelectedDocType(null)}>
                🔄 Change Type
              </Button>
            </div>
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

                <TabsContent value="paste">
                  <div className="grid gap-4">
                    <Label htmlFor="code-input" className="text-base font-medium">
                      Paste your Code
                    </Label>
                    <Textarea
                      id="code-input"
                      placeholder="Paste your code/query here...."
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
                      onClick={handleGenerateDocsFromText}
                      disabled={isLoading || !inputCode}
                    >
                      {isLoading ? "Generating..." : "⚡ Generate from Text"}
                    </Button>
                  </div>
                </TabsContent>

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
                      disabled={!uploadedFiles || isLoading}
                    >
                      {isLoading ? "Generating..." : "⚡ Generate from Files"}
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
                        disabled={isLoading || userPlan === 'free' || userPlan === 'pro'}
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
                        disabled={isLoading}
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
                      disabled={isLoading || !repoUrl.trim() || !isValidGitHubUrl(repoUrl) || userPlan === 'free' || userPlan === 'pro'}
                    >
                      {isLoading ? "Generating..." : <> <Github className="mr-2 h-4 w-4" /> Generate from Repo </>}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />

                  <div className="pt-4 text-sm italic text-muted-foreground text-center transition-opacity duration-500 ease-in-out">
                    <p key={quoteIndex}>{quotes[quoteIndex]}</p>
                  </div>
                </div>
              ) :
                generatedDocs && (
                  <>
                    <div className="mt-6 p-4 rounded-lg border border-border font-mono text-sm relative overflow-auto">
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom" className="w-30">
                            <DropdownMenuItem onClick={handleDownloadDocs}>
                              via Markdown
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={handleDownloadPDF}>
                              via PDF
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="pt-12 overflow-x-auto whitespace-pre-wrap break-words markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers} rehypePlugins={[rehypeRaw]}>
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
