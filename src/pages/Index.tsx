
import React, { useState, useEffect, useRef } from "react";
import { Server, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/navbar"; // Import Navbar

// Import the newly created section components
import { HeroSection } from "./Index/components/HeroSection";
import VSCodeExtensionAnnouncement from "./Index/components/VSCodeExtensionAnnouncement"; // Import the new announcement section
import { GeneratorSection } from "./Index/components/GeneratorSection";
import { ProblemSection } from "./Index/components/ProblemSection";
import { FeaturesSection } from "./Index/components/FeaturesSection";
import { IntegrationsSection } from "./Index/components/IntegrationsSection";
import { PricingSection } from "./Index/components/PricingSection";
import { CtaSection } from "./Index/components/CtaSection";
import { Footer } from "./Index/components/Footer";
import { useAuth } from "@/context/AuthContext"; 

const Index = () => {
  const { token } = useAuth(); 
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
      const apiUrl = import.meta.env.PROD ? `${import.meta.env.VITE_API_BASE_URL}/api/health` : '/api/health';
      try {
        const response = await fetch(apiUrl); // Use dynamic URL
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
  const generateDocsApiCall = async (endpoint: string, body: string | FormData, customHeaders?: HeadersInit) => {
    setIsLoadingDocs(true);
    setGeneratedDocs('');
    setDocsError(null);

    const fullEndpoint = import.meta.env.PROD ? `${import.meta.env.VITE_API_BASE_URL}${endpoint}` : endpoint;

    const headers: HeadersInit = { ...customHeaders }; // Start with custom headers
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      // Avoid overwriting specific auth errors if already set
      if (!docsError) {
        setDocsError(errorMessage);
      }
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
    // For FormData, Content-Type is set by browser. For JSON, we set it.
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
    <div className="flex flex-col min-h-screen"> {/* Use flex column */}
      <Navbar /> {/* Add Navbar */}
      {/* Main content area */}
      <main className="flex-grow"> {/* Make main content grow */}
        {/* Backend Status Indicator */}
        {/* {backendStatus && (
          <Alert variant={backendStatus.error ? "destructive" : "default"} className="container max-w-5xl mx-auto mt-4 mb-2 rounded-lg border">
            {backendStatus.error ? <AlertCircle className="h-4 w-4" /> : <Server className="h-4 w-4" />}
            <AlertTitle className="font-semibold">{backendStatus.error ? "Backend Connection Error" : "Backend Status"}</AlertTitle>
            <AlertDescription>
              {backendStatus.message}
            </AlertDescription>
          </Alert>
        )} */}

        {/* Render the extracted sections */}
        <HeroSection />
        <VSCodeExtensionAnnouncement /> {/* Add the new announcement section here */}

        <GeneratorSection
          inputCode={inputCode}
          setInputCode={setInputCode}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          generatedDocs={generatedDocs}
          setGeneratedDocs={setGeneratedDocs}
          isLoadingDocs={isLoadingDocs}
          docsError={docsError}
          setDocsError={setDocsError}
          fileInputRef={fileInputRef}
          handleGenerateDocsFromText={handleGenerateDocsFromText}
          handleFileChange={handleFileChange}
          handleGenerateDocsFromUpload={handleGenerateDocsFromUpload}
          handleGenerateDocsFromRepo={handleGenerateDocsFromRepo}
          isValidGitHubUrl={isValidGitHubUrl}
          handleDownloadDocs={handleDownloadDocs}
          clearInputs={clearInputs} // Pass clearInputs down
        />

        <ProblemSection />
        <FeaturesSection />
        {/* <IntegrationsSection /> */}
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};


export default Index;
