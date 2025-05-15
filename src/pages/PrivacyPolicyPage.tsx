import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

      <div className="prose prose-lg max-w-4xl mx-auto">
        <p>
          <strong>Last Updated:</strong> 15th May 2025
        </p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to CodeNexAI ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.codenexai.com and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <ul>
          <li>
            <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and display name, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
          </li>
          <li>
            <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
          </li>
          <li>
            <strong>Code Snippets (Temporary):</strong> When you use our documentation generation service, we process the code you provide. As stated in our Security Policy, this code is processed in memory and is not stored persistently on our servers after the generation process is complete.
          </li>
          {/* Add other types of data collected, e.g., payment data if applicable */}
        </ul>

        <h2>3. Use of Your Information</h2>
        <p>
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
        </p>
        <ul>
          <li>Create and manage your account.</li>
          <li>Provide the documentation generation service.</li>
          <li>Email you regarding your account or order.</li>
          <li>Improve the efficiency and operation of the Site.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
          <li>Notify you of updates to the Site.</li>
          <li>Respond to customer service requests.</li>
          {/* Add other uses */}
        </ul>

         <h2>4. Disclosure of Your Information</h2>
         <p>
           We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
         </p>
         <ul>
           <li>
             <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
           </li>
           <li>
             <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance. (Specify providers if possible, e.g., Stripe for payments, AWS for hosting).
           </li>
           {/* Add other disclosures, e.g., Business Transfers */}
         </ul>
         <p>
           We do not sell your personal information.
         </p>

        <h2>5. Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Please refer to our dedicated <a href="/security" className="text-blue-600 hover:underline">Security Page</a> for more details on our security practices.
        </p>

        <h2>6. Policy for Children</h2>
        <p>
          We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at: codenexai.query@gmail.com
        </p>

        {/* Add sections on Cookies, Your Rights (GDPR/CCPA), Changes to Policy etc. as needed */}
        
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
