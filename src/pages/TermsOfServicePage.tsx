import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>

      <div className="prose prose-lg max-w-4xl mx-auto">
        <p>
          <strong>Last Updated:</strong> [Date]
        </p>

        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and DocuGen AI ("we," "us," or "our"), concerning your access to and use of the [Your Website URL] website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”). You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, foreign jurisdictions, and international conventions.
        </p>
        <p>
          Regarding the code you provide for documentation generation: You retain full ownership of your code. We claim no intellectual property rights over the material you provide to the DocuGen AI service. Your code is used solely for the purpose of generating documentation for you and is not stored after processing, as detailed in our <a href="/security" className="text-blue-600 hover:underline">Security Page</a>.
        </p>

        <h2>3. User Representations</h2>
        <p>
          By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service; [...]
          {/* Add other representations */}
        </p>

        <h2>4. Prohibited Activities</h2>
        <p>
          You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Site, you agree not to: [...]
          {/* List prohibited activities */}
        </p>

        <h2>5. Service Usage and Limitations</h2>
        <p>
          Our service generates documentation based on the code you provide. While we strive for accuracy, the generated documentation may contain errors or omissions. You are responsible for reviewing and verifying the accuracy of the generated documentation. We are not liable for any inaccuracies or issues arising from the use of the generated documentation.
        </p>
        <p>
          We reserve the right to impose usage limits (e.g., number of requests, code size) to ensure fair usage and maintain service quality.
        </p>

        <h2>6. Term and Termination</h2>
        <p>
          These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON [...]
          {/* Add termination details */}
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of [Your State/Country] applicable to agreements made and to be entirely performed within [Your State/Country], without regard to its conflict of law principles.
        </p>

        <h2>8. Disclaimer</h2>
        <p>
          THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF [...]
          {/* Full disclaimer text */}
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES [...]
          {/* Full limitation of liability text */}
        </p>

        <h2>10. Contact Us</h2>
        <p>
          In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: [Your Contact Email Address]
        </p>

        <p className="mt-8 italic">
          [Disclaimer: This is a template and may not be legally sufficient for your specific needs. Consult with a legal professional to ensure compliance with all applicable laws and regulations.]
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
