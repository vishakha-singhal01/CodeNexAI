import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express'; // Added RequestHandler
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose'; // Added mongoose
import session from 'express-session'; // Added express-session
import MongoStore from 'connect-mongo'; // Added connect-mongo
import passport from 'passport'; // Added passport
import configurePassport from './config/passport'; // Added passport config import
import authRoutes from './routes/auth'; // Import the auth routes
import paymentsRouter from './routes/payments'; // Import the payment routes
import contactRouter from './routes/contact'; // Import the contact routes
import multer from 'multer';
import axios from 'axios'; // Import axios
import AdmZip from 'adm-zip'; // Import adm-zip
import path from 'path'; // Import path for extension checking
import { generateDocumentation } from './services/documentationService';
import { ErrorRequestHandler } from 'express'; // Import ErrorRequestHandler

dotenv.config(); // Load environment variables from .env file

// --- Passport Configuration ---
configurePassport(); // Call the function to set up strategies

const app: Express = express();

// Trust the first proxy hop (common for services like Render)
// This allows Express/Passport to correctly determine the protocol (http/https)
// based on headers like X-Forwarded-Proto set by the proxy.
app.set('trust proxy', 1);

// --- MongoDB Connection ---
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
    console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
    process.exit(1); // Exit if DB connection string is missing
}

// --- Multer Configuration --- (Moved before middleware setup)
// Store files in memory as Buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Example: 10MB limit per file
  fileFilter: (req, file, cb) => {
    // Basic filter for common code file extensions - refine as needed
    // Important: This filter might be too restrictive for diverse codebases.
    // Consider allowing more types or making it configurable.
    const allowedTypes = /\.(js|ts|jsx|tsx|py|java|md|txt|json|yaml|yml|sh|rb|go|php|cs|cpp|c|h|html|css|scss|less)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      console.warn(`Rejected file type: ${file.originalname}`);
      cb(null, false); // Reject file silently, or use new Error('Invalid file type.') to send error response
    }
  }
});
// Ensure port is treated as a number
const portNumber = Number(process.env.PORT || 3001);

// Enable CORS for specific origin
app.use(cors({
  origin: 'https://dockiedoc.netlify.app', // Allow requests from your frontend
  credentials: true // Allow cookies/sessions to be sent
}));

// Middleware to parse JSON bodies, capturing raw body for webhook verification
app.use(express.json({
  verify: (req: Request & { rawBody?: Buffer }, res, buf, encoding) => {
    // Save the raw buffer onto the request object
    // Type assertion for encoding needed if using older Node/Express types
    if (buf && buf.length) {
      req.rawBody = buf;
    }
  }
}));


// --- Session Configuration ---
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    console.error('FATAL ERROR: SESSION_SECRET is not defined in .env file.');
    process.exit(1); // Exit if session secret is missing
}
// Removed unused @ts-expect-error
app.use(session({
    secret: sessionSecret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ mongoUrl: mongoUri }), // Store session in MongoDB
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
        httpOnly: true, // Prevent client-side JS from accessing cookie
        maxAge: 1000 * 60 * 60 * 24 * 7, // Example: 1 week
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Crucial for cross-site requests in prod (needs secure:true)
    }
})); // Removed cast

// --- Passport Middleware ---
// Removed unused @ts-expect-error
app.use(passport.initialize()); // Initialize Passport
// Removed unused @ts-expect-error
app.use(passport.session()); // Enable persistent login sessions

// Middleware to make user available in templates (if needed later)
// app.use((req, res, next) => {
//   res.locals.user = req.user || null;
//   next();
// });


app.get('/', (req: Request, res: Response) => {
  res.send('AI Documentation Writer Backend is running!');
});

// --- Authentication Routes Placeholder ---
// --- Authentication Routes ---
app.use('/api/auth', authRoutes); // Mount the authentication routes

// --- Payment Routes ---
app.use('/api/payments', paymentsRouter); // Mount the payment routes

// --- Contact Route ---
app.use('/api/contact', contactRouter); // Mount the contact routes

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Define interface for request body
interface GenerateDocsRequestBody {
  code: string;
}

// --- Route Handlers Refactoring ---

// Endpoint to generate documentation (Refactored)
const generateDocsHandler: RequestHandler = async (req, res) => {
  const { code } = req.body as GenerateDocsRequestBody;

  if (!code) {
    res.status(400).json({ error: 'Missing "code" field in request body.' });
    return;
  }

  try {
    const documentation = await generateDocumentation(code);
    res.json({ documentation });
    return;
  } catch (error: unknown) {
    console.error("API Error generating documentation:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to generate documentation.', details: message });
    return;
  }
};

// Endpoint to generate documentation from uploaded files (Refactored)
const uploadGenerateDocsHandler: RequestHandler = async (req, res) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
     res.status(400).json({ error: 'No files were uploaded.' });
     return;
  }

  const files = req.files as Express.Multer.File[];
  const allDocs: string[] = [];
  let hasErrors = false;

  try {
    for (const file of files) {
      const fileContent = file.buffer.toString('utf-8');
      if (!fileContent.trim()) {
        console.log(`Skipping empty file: ${file.originalname}`);
        continue;
      }

      try {
        console.log(`Generating documentation for: ${file.originalname}`);
        const documentation = await generateDocumentation(fileContent);
        allDocs.push(`## File: ${file.originalname}\n\n${documentation}`);
      } catch (fileError: unknown) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        const fileErrorMessage = fileError instanceof Error ? fileError.message : 'An unknown error occurred processing this file';
        allDocs.push(`## File: ${file.originalname}\n\nError generating documentation for this file: ${fileErrorMessage}`);
        hasErrors = true;
      }
    }

    if (allDocs.length === 0) {
       res.status(400).json({ error: 'No processable code content found in uploaded files.' });
       return;
    }

    const combinedDocumentation = allDocs.join('\n\n---\n\n');
    const status = hasErrors ? 207 : 200;
    res.status(status).json({ documentation: combinedDocumentation });
    return;

  } catch (error: unknown) {
    console.error("API Error generating documentation from upload:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to generate documentation from uploaded files.', details: message });
    return;
  }
};

// Define interface for GitHub repo request body
interface GitHubRepoRequestBody {
  repoUrl: string;
}

// Helper function to validate GitHub URL
function isValidGitHubUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'github.com' && parsedUrl.pathname.split('/').filter(Boolean).length >= 2;
  } catch (e) {
    return false;
  }
}

// Endpoint to generate documentation from a GitHub repository URL (Refactored)
const githubRepoDocsHandler: RequestHandler = async (req, res) => {
  const { repoUrl } = req.body as GitHubRepoRequestBody;

  if (!repoUrl || !isValidGitHubUrl(repoUrl)) {
     res.status(400).json({ error: 'Invalid or missing GitHub repository URL.' });
     return;
  }

  const urlParts = new URL(repoUrl);
  const repoPath = urlParts.pathname;
  const downloadUrl = `https://github.com${repoPath}/archive/refs/heads/main.zip`;

  console.log(`Attempting to download repo zip from: ${downloadUrl}`);

  try {
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    console.log(`Downloaded ${response.headers['content-length']} bytes.`);

    const zip = new AdmZip(response.data);
    const zipEntries = zip.getEntries();
    console.log(`Found ${zipEntries.length} entries in zip.`);

    const allDocs: string[] = [];
    let hasErrors = false;
    let processedFileCount = 0;
    const allowedExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.md', '.txt', '.json', '.yaml', '.yml', '.sh', '.rb', '.go', '.php', '.cs', '.cpp', '.c', '.h', '.html', '.css', '.scss', '.less'];

    for (const zipEntry of zipEntries) {
      if (zipEntry.isDirectory || zipEntry.entryName.includes('/.') || zipEntry.entryName.startsWith('.')) continue;
      const fileExt = path.extname(zipEntry.entryName).toLowerCase();
      if (!allowedExts.includes(fileExt)) continue;
      const fileContent = zipEntry.getData().toString('utf-8');
      if (!fileContent.trim()) continue;

      processedFileCount++;
      try {
        console.log(`Generating documentation for: ${zipEntry.entryName}`);
        const documentation = await generateDocumentation(fileContent);
        allDocs.push(`## File: ${zipEntry.entryName}\n\n${documentation}`);
      } catch (fileGenError: unknown) {
        console.error(`Error generating docs for file ${zipEntry.entryName}:`, fileGenError);
        const fileGenErrorMessage = fileGenError instanceof Error ? fileGenError.message : 'An unknown error occurred generating docs for this file';
        allDocs.push(`## File: ${zipEntry.entryName}\n\n_Error generating documentation for this file: ${fileGenErrorMessage}_`);
        hasErrors = true;
      }
    }

    console.log(`Processed ${processedFileCount} code files.`);

    if (allDocs.length === 0) {
       res.status(400).json({ error: 'No processable code files found in the repository.' });
       return;
    }

    const combinedDocumentation = allDocs.join('\n\n---\n\n');
    const status = hasErrors ? 207 : 200;
    res.status(status).json({ documentation: combinedDocumentation });
    return;

  } catch (error: unknown) {
    console.error("API Error fetching/processing GitHub repo:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    if (axios.isAxiosError(error) && error.response?.status === 404) {
       res.status(404).json({ error: 'Repository or default branch (main) not found. Check URL or branch name.' });
       return;
    }
    res.status(500).json({ error: 'Failed to fetch or process GitHub repository.', details: message });
    return;
  }
};

// --- Apply Refactored Handlers ---
app.post('/api/generate-docs', generateDocsHandler);
app.post('/api/upload-generate-docs', upload.array('codeFiles'), uploadGenerateDocsHandler);
app.post('/api/github-repo-docs', githubRepoDocsHandler);


// Placeholder for other API routes related to documentation generation
// app.use('/api/docs', otherDocsRoutes);


// --- Global Error Handler ---
// This should be the LAST middleware added
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err); // Log the error
  // Avoid sending detailed errors in production
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'An unexpected error occurred');
  res.status(statusCode).json({ error: message });
};
app.use(globalErrorHandler);


// --- Start Server Function ---
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully.');

    // 2. Start Listening
    // Listen on all network interfaces, crucial for deployment environments like Render
    app.listen(portNumber, '0.0.0.0', () => {
      console.log(`[server]: Server listening on port ${portNumber}`);
    });

  } catch (error) {
    console.error('FATAL: Failed to start server:', error);
    process.exit(1); // Exit if server cannot start (e.g., DB connection fails)
  }
};

// --- Execute Server Start ---
startServer();
