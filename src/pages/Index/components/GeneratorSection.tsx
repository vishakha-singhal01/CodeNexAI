import React from 'react';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

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
}) => {

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
  
  return (
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
                  <div className="space-y-2"> {/* Added space-y-2 for label spacing */}
                    <Label htmlFor="code-input">Paste Code</Label>
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
                    <Label htmlFor="file-input">Upload Files or Folder</Label>
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
                      <div className="mt-2 space-y-1 max-h-28 overflow-y-auto rounded p-2 border bg-muted/20">
                        <p className="text-sm font-medium mb-1">Selected {uploadedFiles.length} item(s):</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(uploadedFiles).map((file, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {file.name}
                            </Badge>
                          ))}
                        </div>
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
                    <Label htmlFor="repo-url-input">Public GitHub Repository URL</Label>
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
          {isLoadingDocs ? (
            // Loading Skeleton
            <Card className="shadow-md border">
              <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5">
                <Skeleton className="h-6 w-48" /> {/* Skeleton for Title */}
                <Skeleton className="h-8 w-32" /> {/* Skeleton for Button */}
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3"> {/* Added space-y-3 */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ) : (
            // Actual Content or Error
            <>
              {docsError && (
                <Alert variant="destructive" className="mb-6"> {/* Increased margin */}
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Generation Error</AlertTitle>
                  <AlertDescription>{docsError}</AlertDescription>
                </Alert>
              )}
              {generatedDocs && (
                <Card className="shadow-md border">
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
