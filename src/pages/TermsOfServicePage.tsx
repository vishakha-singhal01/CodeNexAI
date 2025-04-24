import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>

      <div className="prose prose-lg max-w-4xl mx-auto">
        <p>
          <strong>Last Updated:</strong> 24-04-2025
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          These Terms of Service (“Terms”) constitute a legally binding agreement between you (“User”, “you”) and TivaAI (“Company”, “we”, “our”, or “us”) governing your access to and use of our website located at [your-website-url] and all related services (collectively, the “Site”). By accessing or using the Site, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree to all of the Terms, you must not access or use the Site.
        </p>

        <h2>2. Intellectual Property</h2>
        <p>
          All content on the Site, including but not limited to source code, databases, functionality, software, website design, text, graphics, audio, and video (collectively, the “Content”) and all trademarks, service marks, and logos (the “Marks”) are the property of TivaAI or its licensors and are protected by intellectual property laws.
        </p>
        <p>
          Any code you upload to our service for the purpose of generating documentation remains your intellectual property. We claim no ownership over your code and do not store it after processing. Please refer to our <a href="/security" className="text-blue-600 hover:underline">Security Policy</a> for more details.
        </p>

        <h2>3. User Responsibilities</h2>
        <p>
          By using the Site, you represent and warrant that: 
          <ul>
            <li>You are at least 18 years of age or have legal parental/guardian consent to use the Site;</li>
            <li>All information provided by you is accurate and up-to-date;</li>
            <li>You will maintain the security of your account credentials;</li>
            <li>Your use of the Site will not violate any applicable laws or regulations.</li>
          </ul>
        </p>

        <h2>4. Prohibited Conduct</h2>
        <p>
          You agree not to engage in any of the following activities:
          <ul>
            <li>Use the Site for any unlawful purpose or in violation of any local, state, national, or international law;</li>
            <li>Access or attempt to access the accounts of other users or penetrate any security measures;</li>
            <li>Upload viruses, malware, or any other harmful code;</li>
            <li>Use automated scripts to collect information or interact with the Site.</li>
          </ul>
        </p>

        <h2>5. Service Usage and Limitations</h2>
        <p>
          The Site provides AI-powered code documentation services. While we strive to ensure high-quality output, we do not guarantee the completeness or accuracy of the generated documentation. Users are responsible for verifying all results before use.
        </p>
        <p>
          We reserve the right to enforce fair usage limits, including but not limited to the number of requests and the size of uploaded files.
        </p>

        <h2>6. Termination</h2>
        <p>
          We may suspend or terminate your access to the Site at our sole discretion, with or without notice, for any conduct that we believe violates these Terms or is otherwise harmful to the Site or other users.
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These Terms are governed by the laws of [Insert Jurisdiction], without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in [Insert Jurisdiction].
        </p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          THE SITE IS PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW,  TivaAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SITE.
        </p>

        <h2>10. Contact Information</h2>
        <p>
          If you have any questions or concerns regarding these Terms, please contact us at: <strong>[Insert Contact Email]</strong>
        </p>

        <p className="mt-8 italic">
          Disclaimer: This document is a general template and may not address all legal requirements. Please consult a qualified attorney to ensure full compliance with applicable laws.
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
