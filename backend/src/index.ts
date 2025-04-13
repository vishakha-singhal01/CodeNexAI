import express, { Express, Request, Response, NextFunction } from 'express'; // Added NextFunction
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose'; // Added mongoose
import session from 'express-session'; // Added express-session
import MongoStore from 'connect-mongo'; // Added connect-mongo
import passport from 'passport'; // Added passport
import configurePassport from './config/passport'; // Added passport config import
import authRoutes from './routes/auth'; // Import the auth routes
import paymentsRouter from './routes/payments'; // Import the payment routes
import multer from 'multer';
import axios from 'axios'; // Import axios
import AdmZip from 'adm-zip'; // Import adm-zip
import path from 'path'; // Import path for extension checking
import { generateDocumentation } from './services/documentationService';

dotenv.config(); // Load environment variables from .env file

// --- Passport Configuration ---
configurePassport(); // Call the function to set up strategies

const app: Express = express();

// --- MongoDB Connection ---
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
  process.exit(1); // Exit if DB connection string is missing
}
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- Multer Configuration ---
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
const port = process.env.PORT || 3001; // Use port from env or default to 3001

// Enable CORS for specific origin
app.use(cors({
  origin: 'http://localhost:8080', // Allow requests from your frontend
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
app.use(session({
    secret: sessionSecret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ mongoUrl: mongoUri }), // Store session in MongoDB
    cookie: {
        // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
        // httpOnly: true, // Prevent client-side JS from accessing cookie
        maxAge: 1000 * 60 * 60 * 24 * 7 // Example: 1 week
    }
}));

// --- Passport Middleware ---
app.use(passport.initialize()); // Initialize Passport
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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Define interface for request body
interface GenerateDocsRequestBody {
  code: string;
}

// Endpoint to generate documentation
app.post('/api/generate-docs', (req: Request, res: Response) => {
  // Use a self-invoking async function to handle the async logic
  (async () => {
    const { code } = req.body as GenerateDocsRequestBody;

    if (!code) {
      return res.status(400).json({ error: 'Missing "code" field in request body.' });
    }

    try {
      const documentation = await generateDocumentation(code);
      res.json({ documentation });
    } catch (error: unknown) { // Use unknown instead of any
      console.error("API Error generating documentation:", error);
      // Send a generic error message to the client
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: 'Failed to generate documentation.', details: message });
    }
  })().catch(err => {
    // Catch any unexpected errors from the async block itself
    console.error("Unhandled error in /api/generate-docs:", err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });
});

// Endpoint to generate documentation from uploaded files
// 'codeFiles' should match the name attribute of the file input in the frontend form
app.post('/api/upload-generate-docs', upload.array('codeFiles'), (req: Request, res: Response) => {
  // Use a self-invoking async function to handle the async logic
  (async () => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    // Ensure req.files is treated as an array
    const files = req.files as Express.Multer.File[];
    const allDocs: string[] = [];
    let hasErrors = false;

    try {
      // Process each file individually
      for (const file of files) {
        const fileContent = file.buffer.toString('utf-8');
        if (!fileContent.trim()) {
          console.log(`Skipping empty file: ${file.originalname}`);
          continue; // Skip empty files
        }

        try {
          console.log(`Generating documentation for: ${file.originalname}`);
          // Pass filename to generateDocumentation if you modify it to accept it
          // For now, it extracts structures internally based on content only
          const documentation = await generateDocumentation(fileContent);
          // Add a header for each file's documentation
          allDocs.push(`## File: ${file.originalname}\n\n${documentation}`);
        } catch (fileError: unknown) { // Use unknown instead of any
          console.error(`Error processing file ${file.originalname}:`, fileError);
          const fileErrorMessage = fileError instanceof Error ? fileError.message : 'An unknown error occurred processing this file';
          allDocs.push(`## File: ${file.originalname}\n\nError generating documentation for this file: ${fileErrorMessage}`);
          hasErrors = true; // Mark that at least one file failed
        }
      }

      if (allDocs.length === 0) {
        return res.status(400).json({ error: 'No processable code content found in uploaded files.' });
      }

      // Combine documentation from all files
      const combinedDocumentation = allDocs.join('\n\n---\n\n'); // Separator between files

      // Decide status based on whether any file processing failed
      const status = hasErrors ? 207 : 200; // 207 Multi-Status if some failed
      res.status(status).json({ documentation: combinedDocumentation });

    } catch (error: unknown) { // Use unknown instead of any
      console.error("API Error generating documentation from upload:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: 'Failed to generate documentation from uploaded files.', details: message });
    }
  })().catch(err => {
    console.error("Unhandled error in /api/upload-generate-docs:", err);
    res.status(500).json({ error: 'An unexpected server error occurred during file processing.' });
  });
});

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

// Endpoint to generate documentation from a GitHub repository URL
// Use Record<string, unknown> or specific types instead of {}
app.post('/api/github-repo-docs', (req: Request<Record<string, unknown>, Record<string, unknown>, GitHubRepoRequestBody>, res: Response) => {
 (async () => {
    const { repoUrl } = req.body;

    if (!repoUrl || !isValidGitHubUrl(repoUrl)) {
      return res.status(400).json({ error: 'Invalid or missing GitHub repository URL.' });
    }

    // Construct the download URL (usually main branch, could be configurable)
    // Example: https://github.com/user/repo -> https://github.com/user/repo/archive/refs/heads/main.zip
    const urlParts = new URL(repoUrl);
    const repoPath = urlParts.pathname;
    const downloadUrl = `https://github.com${repoPath}/archive/refs/heads/main.zip`; // Adjust branch name if needed

    console.log(`Attempting to download repo zip from: ${downloadUrl}`);

    try {
      // 1. Download the zip file
      const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      console.log(`Downloaded ${response.headers['content-length']} bytes.`);

      // 2. Extract the zip file in memory
      const zip = new AdmZip(response.data);
      const zipEntries = zip.getEntries();
      console.log(`Found ${zipEntries.length} entries in zip.`);

      const allDocs: string[] = [];
      let hasErrors = false;
      let processedFileCount = 0;

      // Allowed extensions (sync with multer config)
      const allowedExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.md', '.txt', '.json', '.yaml', '.yml', '.sh', '.rb', '.go', '.php', '.cs', '.cpp', '.c', '.h', '.html', '.css', '.scss', '.less'];

      // 3. Process each file
      for (const zipEntry of zipEntries) {
        // Skip directories and files in hidden/config folders (basic filtering)
        if (zipEntry.isDirectory || zipEntry.entryName.includes('/.') || zipEntry.entryName.startsWith('.')) {
          continue;
        }

        const fileExt = path.extname(zipEntry.entryName).toLowerCase();
        if (!allowedExts.includes(fileExt)) {
          // console.log(`Skipping file with unsupported extension: ${zipEntry.entryName}`);
          continue;
        }

        // Extract file content
        const fileContent = zipEntry.getData().toString('utf-8');
        if (!fileContent.trim()) {
          // console.log(`Skipping empty file: ${zipEntry.entryName}`);
          continue; // Skip empty files
        }

        processedFileCount++;
        // Add specific try/catch around generation for this file
        try {
          console.log(`Generating documentation for: ${zipEntry.entryName}`);
          // Pass filename to generateDocumentation if you modify it to accept it
          const documentation = await generateDocumentation(fileContent);
          allDocs.push(`## File: ${zipEntry.entryName}\n\n${documentation}`);
        } catch (fileGenError: unknown) { // Use unknown instead of any
          console.error(`Error generating docs for file ${zipEntry.entryName}:`, fileGenError); // Log the whole error
          // Add specific error message for this file, but continue processing others
          const fileGenErrorMessage = fileGenError instanceof Error ? fileGenError.message : 'An unknown error occurred generating docs for this file';
          allDocs.push(`## File: ${zipEntry.entryName}\n\n_Error generating documentation for this file: ${fileGenErrorMessage}_`);
          hasErrors = true; // Mark that at least one file failed
        }
      } // End of loop through zip entries

      console.log(`Processed ${processedFileCount} code files.`);

      if (allDocs.length === 0) {
        return res.status(400).json({ error: 'No processable code files found in the repository.' });
      }

      const combinedDocumentation = allDocs.join('\n\n---\n\n');
      const status = hasErrors ? 207 : 200;
      res.status(status).json({ documentation: combinedDocumentation });

    } catch (error: unknown) { // Use unknown instead of any
      console.error("API Error fetching/processing GitHub repo:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      if (axios.isAxiosError(error) && error.response?.status === 404) {
         return res.status(404).json({ error: 'Repository or default branch (main) not found. Check URL or branch name.' });
      }
      res.status(500).json({ error: 'Failed to fetch or process GitHub repository.', details: message });
    }
  })().catch(err => {
    console.error("Unhandled error in /api/github-repo-docs:", err);
    res.status(500).json({ error: 'An unexpected server error occurred during repository processing.' });
  });
});


// Placeholder for other API routes related to documentation generation
// app.use('/api/docs', otherDocsRoutes);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
