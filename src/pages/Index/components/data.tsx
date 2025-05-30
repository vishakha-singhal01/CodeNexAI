import React from 'react';
import {
  Github,
  Download,
  ChevronDown,
  FileText,
  BookOpen,
  Layers,
  ListTree,
  Activity,
  GitBranch,
  Code,
  ClipboardList,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Plug,
  HelpCircle,
  Grid,
} from 'lucide-react';

// Pro and Enterprise label badges
const ProLabel = () => (
  <span className="ml-1 inline-block rounded bg-purple-200 px-1.5 py-0.5 text-xs font-semibold text-purple-800">
    Pro
  </span>
);

const EnterpriseLabel = () => (
  <span className="ml-1 inline-block rounded bg-green-200 px-1.5 py-0.5 text-xs font-semibold text-green-800">
    Enterprise
  </span>
);

export const docTypeOptions = [
  "API Documentation",
  "Codebase Documentation",
  "Tutorials/Guides",
  "Conceptual Overviews",
  "Sequence Diagram",
  "UML Diagram",
  "Flowchart",
  "Release Notes",
  "API Change Log",
  "Troubleshooting Guide",
  "Security Guidelines",
  "Performance Analysis",
  "Integration Guide",
  "FAQ",
  "Architecture Overview",
];

export const docTypeIconMap: Record<
  string,
  { icon: React.ReactNode; enabled: boolean }
> = {
  'API Documentation': {
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    enabled: true,
  },
  'Codebase Documentation': {
    icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
    enabled: true,
  },
  'Tutorials/Guides': {
    icon: <Layers className="h-6 w-6 text-purple-600" />,
    enabled: true,
  },
  'Conceptual Overviews': {
    icon: <ListTree className="h-6 w-6 text-pink-600" />,
    enabled: true,
  },
  'Sequence Diagram': {
    icon: (
      <>
        <Activity className="h-6 w-6 text-orange-600" />
        <ProLabel />
      </>
    ),
    enabled: false,
  },
  'UML Diagram': {
    icon: (
      <>
        <GitBranch className="h-6 w-6 text-green-600" />
        <EnterpriseLabel />
      </>
    ),
    enabled: false,
  },
  'Flowchart': {
    icon: (
      <>
        <Code className="h-6 w-6 text-yellow-600" />
        <ProLabel />
      </>
    ),
    enabled: false,
  },
  'Release Notes': {
    icon: <ClipboardList className="h-6 w-6 text-gray-600" />,
    enabled: true,
  },
  'API Change Log': {
    icon: (
      <>
        <ClipboardList className="h-6 w-6 text-teal-600" />
        <ProLabel />
      </>
    ),
    enabled: false,
  },
  'Troubleshooting Guide': {
    icon: <AlertCircle className="h-6 w-6 text-red-600" />,
    enabled: true,
  },
  'Security Guidelines': {
    icon: (
      <>
        <ShieldCheck className="h-6 w-6 text-red-800" />
        <EnterpriseLabel />
      </>
    ),
    enabled: false,
  },
  'Performance Analysis': {
    icon: (
      <>
        <TrendingUp className="h-6 w-6 text-yellow-800" />
        <ProLabel />
      </>
    ),
    enabled: false,
  },
  'Integration Guide': {
    icon: <Plug className="h-6 w-6 text-cyan-600" />,
    enabled: true,
  },
  FAQ: {
    icon: <HelpCircle className="h-6 w-6 text-indigo-400" />,
    enabled: true,
  },
  'Architecture Overview': {
    icon: (
      <>
        <Grid className="h-6 w-6 text-pink-400" />
        <ProLabel />
      </>
    ),
    enabled: false,
  },
};

export const tieredDocTypes = {
  free: [
    'API Documentation',
    'Codebase Documentation',
    'Tutorials/Guides',
    'Conceptual Overviews',
    'Release Notes',
    'Troubleshooting Guide',
    'Integration Guide',
    'FAQ',
  ],
  pro: [
    'Sequence Diagram',
    'Flowchart',
    'API Change Log',
    'Performance Analysis',
    'Architecture Overview',
    'Release Notes',
    'Integration Guide',
  ],
  enterprise: [
    'UML Diagram',
    'Security Guidelines',
    'Sequence Diagram',
    'Flowchart',
    'API Change Log',
    'Performance Analysis',
    'Architecture Overview',
  ],
};

export const docTypeDescriptionMap: Record<string, string> = {
  'API Documentation': 'Structured documentation for APIs, including endpoints, methods, and parameters.',
  'Codebase Documentation': 'Internal explanation of code structure, files, and logic for developers.',
  'Tutorials/Guides': 'Step-by-step instructions or how-to content for specific tasks or features.',
  'Conceptual Overviews': 'High-level explanation of system architecture, ideas, and key concepts.',
  'Sequence Diagram': 'Visual representation of the order of operations or messages over time.',
  'UML Diagram': 'Unified Modeling Language diagrams for designing and analyzing software systems.',
  'Flowchart': 'Graphical representation of a process or workflow using symbols and arrows.',
  'Release Notes': 'Detailed records of changes, fixes, and updates for each release version.',
  'API Change Log': 'Specific changes and version history focused on API updates.',
  'Troubleshooting Guide': 'Instructions to diagnose and fix common problems.',
  'Security Guidelines': 'Best practices and protocols for securing software and systems.',
  'Performance Analysis': 'Reports and insights on system or code performance metrics.',
  'Integration Guide': 'Instructions for integrating with third-party services or APIs.',
  'FAQ': 'Frequently asked questions and answers related to the product or service.',
  'Architecture Overview': 'Detailed explanation of system architecture and design decisions.',
};

export const quotes = [
  "“Talk is cheap. Show me the code.” – Linus Torvalds",
  "“Programs must be written for people to read, and only incidentally for machines to execute.” – Harold Abelson",
  "“First, solve the problem. Then, write the code.” – John Johnson",
  "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
  "“Fix the cause, not the symptom.” – Steve Maguire",
  "“Simplicity is the soul of efficiency.” – Austin Freeman",
  "“Before software can be reusable it first has to be usable.” – Ralph Johnson",
  "“Programming isn’t about what you know; it’s about what you can figure out.” – Chris Pine",
  "“The only way to learn a new programming language is by writing programs in it.” – Dennis Ritchie",
  "“In order to be irreplaceable, one must always be different.” – Coco Chanel (applied to devs too!)",
  "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde (debugging edition)",
];
