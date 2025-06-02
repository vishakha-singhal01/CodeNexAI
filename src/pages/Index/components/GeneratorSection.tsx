import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import html2pdf from 'html2pdf.js';
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
  const markdownRef = useRef<HTMLDivElement>(null);

  const tabOptions = [
    { value: "paste", label: "Paste Code", disabled: false, badge: null },
    { value: "upload", label: "Upload", disabled: userPlan === 'free', badge: userPlan === 'free' ? "Pro+" : null },
    { value: "github", label: "GitHub Repo", disabled: userPlan === 'free' || userPlan === 'pro', badge: (userPlan === 'free' || userPlan === 'pro') ? "Enterprise" : null },
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === selectedTab)?.label || "Select Option";

  const handleDownloadPDF = () => {
    if (!markdownRef.current) return;

    const opt = {
      margin: 0.5,
      filename: 'codenexai-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(markdownRef.current).save();
  };

  const handleDownloadHTML = () => {
    if (!markdownRef.current) return;

    const htmlContent = markdownRef.current.innerHTML;
    const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Document</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

    const blob = new Blob([fullHTML], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "codenexai-document.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <a href={href} target='_blank' className="text-blue-600 underline" rel="noopener noreferrer">
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
  className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-[#fff1f7] via-[#fde2ff] to-[#f3e8ff] text-gray-900"
>


      <div className="container px-4 md:px-6 max-w-6xl mx-auto ">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <div className="inline-block mb-2">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              AI-Powered
            </Badge>
          </div>
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            ✨ Try the AI Generator
          </h2>
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
              className="px-3 py-1 text-sm rounded-full bg-muted/80 text-foreground border border-border shadow-sm hover:bg-muted transition-colors"
            >
              {lang}
            </span>
          ))}
        </div>

        {!selectedDocType ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex space-x-4 mb-6 border-b border-border">
              {(["free", "pro", "enterprise"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTierTab(tab)}
                  className={`py-3 px-6 font-medium border-b-2 transition-all ${
                    selectedTierTab === tab ? "border-primary text-primary" : "border-transparent hover:text-primary/70"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {tieredDocTypes[selectedTierTab]?.map((type) => (
                <Card
                  key={type}
                  onClick={() => {
                    if (docTypeIconMap[type as keyof typeof docTypeIconMap].enabled) {
                      handleSelectType(type)
                    }
                  }}
                  className={cn(
                    "transition-all duration-300 p-6 flex flex-col items-center justify-center text-center border hover:border-primary/50",
                    docTypeIconMap[type as keyof typeof docTypeIconMap].enabled
                      ? "cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                      : "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="mb-4">{docTypeIconMap[type as keyof typeof docTypeIconMap].icon}</div>
                  <div className="font-semibold text-lg mb-2">{type}</div>
                  <div className="text-sm text-muted-foreground">
                    {docTypeDescriptionMap[type as keyof typeof docTypeDescriptionMap]}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-16 max-w-5xl mx-auto">
            <Card className="border shadow-xl shadow-primary/5 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">
                    {docTypeIconMap[selectedDocType as keyof typeof docTypeIconMap].icon}
                  </h3>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedDocType}</h3>
                    <p className="text-sm text-muted-foreground">
                      {docTypeDescriptionMap[selectedDocType as keyof typeof docTypeDescriptionMap]}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={!!isLoading}
                  onClick={() => setSelectedDocType(null)}
                  className="hover:bg-muted"
                >
                  Change Type
                </Button>
              </div>
              <CardContent className="p-6 lg:p-8">
                <Tabs value={selectedTab} onValueChange={handleTabChangeInternal} className="w-full">
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

                  <TabsContent value="paste" className="space-y-6">
                    <div className="grid gap-4">
                      <Label htmlFor="code-input" className="text-base font-medium">
                        Paste your Code
                      </Label>
                      <Textarea
                        id="code-input"
                        placeholder="Paste your code/query here...."
                        value={inputCode}
                        onChange={(e) => {
                          setInputCode(e.target.value)
                          setUploadedFiles(null)
                          setRepoUrl("")
                          setGeneratedDocs("")
                          setDocsError(null)
                        }}
                        className="min-h-[200px] font-mono text-sm bg-muted/20 border border-border rounded-lg resize-y"
                      />
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                        onClick={handleGenerateDocsFromText}
                        disabled={isLoading || !inputCode}
                      >
                        {isLoading ? "Generating..." : "⚡ Generate from Text"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-6">
                    <div className="grid gap-4">
                      <Label htmlFor="file-input" className="text-base font-medium">
                        Upload Folder
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <Input
                          id="file-input"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          multiple
                          webkitdirectory="true"
                          directory="true"
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 rounded-full bg-primary/10">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-primary"
                            >
                              <path
                                d="M12 16L12 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9 11L12 8 15 11"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 16L12 20L16 16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <Button
                              variant="ghost"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-primary hover:text-primary/80"
                            >
                              Choose files
                            </Button>
                            <span className="text-sm text-muted-foreground"> or drag and drop</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Only available on Pro & Enterprise plans</p>
                        </div>
                      </div>

                      {uploadedFiles?.length > 0 && (
                        <div className="bg-muted/20 p-4 rounded-md border max-h-32 overflow-y-auto">
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
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                        onClick={handleGenerateDocsFromUpload}
                        disabled={!uploadedFiles || isLoading}
                      >
                        {isLoading ? "Generating..." : "⚡ Generate from Files"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="github" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="repo-url-input" className="text-base font-medium">
                          GitHub Repository URL
                        </Label>
                        <Input
                          id="repo-url-input"
                          placeholder="https://github.com/username/repository-name"
                          value={repoUrl}
                          onChange={(e) => {
                            setRepoUrl(e.target.value)
                            setInputCode("")
                            setUploadedFiles(null)
                            setGeneratedDocs("")
                            setDocsError(null)
                          }}
                          className="font-mono text-sm h-11 rounded-md"
                          disabled={isLoading || userPlan === "free" || userPlan === "pro"}
                        />
                        <p className="text-sm text-muted-foreground pt-1">
                          Enter the full URL of a GitHub repository. (Available for Enterprise plan)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github-token-input" className="text-base font-medium flex items-center gap-2">
                          GitHub Token
                          <span className="text-xs text-muted-foreground font-normal">
                            (Optional for public repos, required for private)
                          </span>
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
                        <div className="text-sm text-muted-foreground space-y-1 pt-2 bg-muted/30 p-4 rounded-lg border border-border">
                          <p className="font-medium">Steps to get a GitHub Token:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>
                              Go to{" "}
                              <a
                                href="https://github.com/settings/tokens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                GitHub Developer Settings
                              </a>
                              .
                            </li>
                            <li>
                              Click on <strong>"Generate new token"</strong> (or <strong>"Fine-grained token"</strong>{" "}
                              for more control).
                            </li>
                            <li>Set a name and expiration date for your token.</li>
                            <li>
                              Select the scopes/permissions you need (e.g.,{" "}
                              <code className="bg-muted/50 px-1 py-0.5 rounded text-xs">repo</code> to access private
                              repositories).
                            </li>
                            <li>
                              Click <strong>"Generate token"</strong> at the bottom.
                            </li>
                            <li>Copy and paste the token here. You won't be able to view it again later.</li>
                          </ol>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                        onClick={handleGenerateDocsFromRepo}
                        disabled={
                          isLoading ||
                          !repoUrl.trim() ||
                          !isValidGitHubUrl(repoUrl) ||
                          userPlan === "free" ||
                          userPlan === "pro"
                        }
                      >
                        {isLoading ? (
                          "Generating..."
                        ) : (
                          <>
                            {" "}
                            <Github className="mr-2 h-4 w-4" /> Generate from Repo{" "}
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {isLoading ? (
                  <div className="space-y-6 mt-8 p-6 border rounded-lg bg-muted/10">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <div className="text-lg font-medium">Generating Documentation</div>
                    </div>

                    <div className="space-y-4">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>

                    <div className="pt-4 text-sm italic text-muted-foreground text-center transition-opacity duration-500 ease-in-out">
                      <p key={quoteIndex} className="animate-pulse">
                        {quotes[quoteIndex]}
                      </p>
                    </div>
                  </div>
                ) : (
                  generatedDocs && (
                    <div className="mt-8 px-4 rounded-lg border border-border overflow-hidden">
                      <div className="bg-muted/30 p-4 flex items-center justify-between border-b">
                        <h3 className="font-medium">Generated Documentation</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom">
                            <DropdownMenuItem onClick={handleDownloadDocs}>Download as Markdown</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownloadHTML}>Download as HTML</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownloadPDF}>Download as PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="pt-12 overflow-x-auto whitespace-pre-wrap break-words markdown-body" ref={markdownRef}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers} rehypePlugins={[rehypeRaw]}>
                          {generatedDocs}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )
                )}

                {docsError && (
                  <div className="mt-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {docsError}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};
