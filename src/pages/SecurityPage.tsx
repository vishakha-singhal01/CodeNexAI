import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, DatabaseZap, Mail, FileText } from 'lucide-react'; // Example icons

const SecurityPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Commitment to Security</h1>

      <div className="space-y-8">
        {/* Code Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseZap className="h-6 w-6" /> Code Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We understand the sensitivity of your code. When you use our documentation generation service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>In-Memory Processing:</strong> Your code is processed entirely in memory on our secure servers.
              </li>
              <li>
                <strong>No Storage Policy:</strong> We do not store your code snippets or uploaded files after the documentation generation process is complete. Once the request is fulfilled, the code data is discarded.
              </li>
              <li>
                <strong>Confidentiality:</strong> We treat your code with the utmost confidentiality and do not access or review it, except as strictly necessary to provide the service or troubleshoot technical issues with your explicit consent.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" /> Account Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Protecting your account is a top priority. We employ several measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Password Hashing:</strong> We use industry-standard, strong hashing algorithms (like bcrypt) to store your passwords securely. We never store passwords in plain text.
              </li>
              <li>
                <strong>Secure Login:</strong> Our login mechanisms are designed to prevent common attacks.
              </li>
              <li>
                <strong>Rate Limiting:</strong> We implement rate limiting on login attempts and other sensitive actions to mitigate brute-force attacks.
              </li>
              <li>
                <strong>OAuth Security:</strong> If you use third-party login providers (e.g., Google, GitHub), we follow OAuth 2.0 best practices to ensure secure authentication.
              </li>
            </ul>
             <p className="mt-4 text-sm text-muted-foreground">
               Remember to use a strong, unique password for your account.
             </p>
          </CardContent>
        </Card>

        {/* Data Transmission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6" /> Data Transmission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              All data transmitted between your browser and our servers is encrypted using HTTPS (TLS/SSL). This ensures that your information, including login credentials and any code snippets during processing, is protected from eavesdropping during transit. 
              {/* Look for the lock icon <Lock className="inline h-4 w-4" /> in your browser's address bar. */}
            </p>
          </CardContent>
        </Card>

        {/* Infrastructure */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Infrastructure Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our application is hosted on reputable cloud providers (e.g., AWS, Google Cloud, Azure - *[Specify if known, otherwise keep general]*) that maintain high standards of physical and network security. We follow secure deployment practices and regularly update our systems.
            </p>
          </CardContent>
        </Card> */}

        {/* Vulnerability Reporting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" /> Vulnerability Reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We value the security community. If you believe you have discovered a security vulnerability in our service, please report it to us responsibly at{' '}
              <a href="mailto:singhalvishakha@gmail.com" className="text-blue-600 hover:underline">
              singhalvishakha@gmail.com
              </a>.
              We appreciate your efforts in helping us keep our platform secure. Please provide detailed information so we can investigate thoroughly.
            </p>
             <p className="mt-2 text-sm text-muted-foreground">
               Please do not publicly disclose vulnerabilities until we have had a chance to address them.
             </p>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" /> Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our commitment to security is also reflected in our Privacy Policy. It details how we handle your data, including code uploads and authentication information, and outlines the security measures in place.
            </p>
            {/* TODO: Add a link to the actual Privacy Policy page once available */}
            {/* <p className="mt-2"><a href="/privacy-policy" className="text-blue-600 hover:underline">Read our Privacy Policy</a></p> */}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SecurityPage;
