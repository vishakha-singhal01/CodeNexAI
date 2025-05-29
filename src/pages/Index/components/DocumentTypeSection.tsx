// DocumentTypesSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileCheck, FileSearch, FileX, FilePlus, FileSignature, FileCog } from 'lucide-react';

type DocumentType = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const documentTypes: DocumentType[] = [
  {
    id: 1,
    title: 'Summary Document',
    description: 'Generate concise summaries from long content.',
    icon: <FileText className="w-8 h-8 text-blue-500" />,
  },
  {
    id: 2,
    title: 'Compliance Report',
    description: 'Automate legal and compliance documents.',
    icon: <FileCheck className="w-8 h-8 text-green-500" />,
  },
  {
    id: 3,
    title: 'Research Extract',
    description: 'Extract key insights from research papers.',
    icon: <FileSearch className="w-8 h-8 text-purple-500" />,
  },
  {
    id: 4,
    title: 'Error Analysis Report',
    description: 'Identify and document common errors in data.',
    icon: <FileX className="w-8 h-8 text-red-500" />,
  },
  {
    id: 5,
    title: 'Project Brief',
    description: 'Create briefs for quick stakeholder understanding.',
    icon: <FilePlus className="w-8 h-8 text-yellow-500" />,
  },
  {
    id: 6,
    title: 'Contract Generator',
    description: 'Auto-generate legal contracts and templates.',
    icon: <FileSignature className="w-8 h-8 text-indigo-500" />,
  },
  {
    id: 7,
    title: 'Technical Spec Sheet',
    description: 'Generate specs from technical input data.',
    icon: <FileCog className="w-8 h-8 text-teal-500" />,
  },
];

const DocumentTypesSection: React.FC = () => {
  return (
    <section className="py-16 px-4 md:px-12 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          📄 Document Generators
        </h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {doc.icon}
                    <h3 className="text-xl font-semibold text-gray-800">{doc.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                  <Button className="mt-auto">Try Now</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentTypesSection;
