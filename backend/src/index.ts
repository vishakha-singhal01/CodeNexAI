import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cookieParser from 'cookie-parser';
// import csrf from 'csurf';
import configurePassport from './config/passport.js';
import authRoutes from './routes/auth';
import paymentsRouter from './routes/payments';
import contactRouter from './routes/contact';
import multer from 'multer';
import axios from 'axios';
import AdmZip from 'adm-zip';
import path from 'path';
import { generateDocumentation } from './services/documentationService';
import { IUser } from './models/User';
import { indexCodebase, codeSearch } from './code-search';
// Removed ErrorRequestHandler import

dotenv.config();

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
    process.exit(1); // Exit if DB connection string is missing
}
// Connect to MongoDB at top level again
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
// Ensure port is treated as a number
const portNumber = Number(process.env.PORT || 3001);

// --- CORS Configuration ---
const allowedOrigins = [
  'https://dockiedoc.netlify.app', // Production frontend
  'https://www.codenexai.com',    // New production frontend
  'http://localhost:5173',        // Common Vite dev port
  'http://localhost:3000',        // Common React dev port
  'http://localhost:8080',        // Add your current frontend dev port
  // Add any other origins you need (e.g., preview deployment URLs)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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

// --- Cookie Parser Middleware ---
// Must come before session and csurf
app.use(cookieParser());

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

// --- CSRF Protection Middleware ---
// Must come after cookieParser and session middleware
// const csrfProtection = csrf({ cookie: true }); // Temporarily disabled for testing
// app.use(csrfProtection); // Temporarily disabled for testing

// Middleware to make user available in templates (if needed later)
// app.use((req, res, next) => {
//   res.locals.user = req.user || null;
//   next();
// });


app.get('/', (req: Request, res: Response) => {
  res.send('AI Documentation Writer Backend is running!');
});

// --- CSRF Token Endpoint ---
// Route for frontend to fetch the CSRF token
// app.get('/api/csrf-token', (req: Request, res: Response) => { // Temporarily disabled for testing
//   res.json({ csrfToken: req.csrfToken() });
// });

// --- Authentication Routes Placeholder ---
// --- Authentication Routes ---
app.use('/api/auth', authRoutes); // Mount the authentication routes

// --- Payment Routes ---
app.use('/api/payments', paymentsRouter); // Mount the payment routes

// --- Contact Route ---
app.use('/api/contact', contactRouter); // Mount the contact routes

const vscodeAuthStartHandler: RequestHandler = (req: Request, res: Response) => {
  const redirectUriFromQuery = req.query.redirect_uri as string | undefined;

  // Basic validation for redirect_uri
  if (!redirectUriFromQuery || !redirectUriFromQuery.startsWith('vscode://')) {
    res.status(400).send('Invalid or missing redirect_uri for VS Code login.');
    return; // Explicitly return to end execution here after sending response
  }

  // Check for error messages passed back from a failed login attempt
  const errorParam = req.query.error as string | undefined;
  const messageParam = req.query.message as string | undefined;
  let errorMessage = '';
  if (errorParam && messageParam) {
    errorMessage = decodeURIComponent(messageParam);
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodenexAI VS Code Login</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; background-color: #f0f2f5; color: #333; }
        .container { background-color: #ffffff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; width: 100%; max-width: 400px; }
        h1 { margin-bottom: 25px; color: #1a2b4d; font-size: 24px; }
        label { display: block; margin-bottom: 8px; text-align: left; color: #555; font-weight: 500; }
        input[type="email"], input[type="password"] { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 16px; }
        input[type="email"]:focus, input[type="password"]:focus { border-color: #007bff; outline: none; box-shadow: 0 0 0 2px rgba(0,123,255,.25); }
        button { background-color: #007bff; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; transition: background-color 0.2s; }
        button:hover { background-color: #0056b3; }
        .error-message { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: left; }
        .info-message { color: #004085; background-color: #cce5ff; border: 1px solid #b8daff; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: left; }
    </style>
</head>
<body>
    <div class="container">
        <h1>CodenexAI Login</h1>
        ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ''}
        ${!redirectUriFromQuery ? `<div class="error-message">Error: Missing or invalid redirect_uri. Cannot proceed with VS Code login. Please initiate login from VS Code again.</div>` : ''}
        
        <form id="loginForm" method="POST" action="/api/auth/vscode-login" style="${!redirectUriFromQuery ? 'display:none;' : ''}">
            <input type="hidden" id="redirect_uri" name="redirect_uri" value="${redirectUriFromQuery || ''}">
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
    <script>
        // No client-side JS needed for basic functionality as redirect_uri is embedded by server.
        // Error messages are also embedded by the server.
        // If redirect_uri was missing, the form is hidden by server-side conditional style.
    </script>
</body>
</html>`;
  res.send(htmlContent);
};

// --- VS Code Authentication Start Page ---
app.get('/vscode-auth-start', vscodeAuthStartHandler);
// --- End VS Code Authentication Start Page ---

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
const generateDocsHandler = async (req: Request, res: Response, next: NextFunction) => {
  let user: IUser | undefined;
  if (req.isAuthenticated()) {
    user = req.user as IUser;
  }
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
const uploadGenerateDocsHandler = async (req: Request, res: Response, next: NextFunction) => {
  let user: IUser | undefined;
  if (req.isAuthenticated()) {
    user = (req.user as IUser) as IUser;
  }
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
  githubToken?: string;
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
const githubRepoDocsHandler = async (req: Request, res: Response, next: NextFunction) => {
  let user: IUser | undefined;
  if (req.isAuthenticated()) {
    user = (req.user as IUser) as IUser;
  }
const { repoUrl, githubToken } = req.body as GitHubRepoRequestBody;

  if (!repoUrl || !isValidGitHubUrl(repoUrl)) {
     res.status(400).json({ error: 'Invalid or missing GitHub repository URL.' });
     return;
  }

  const urlParts = new URL(repoUrl);
  const repoPath = urlParts.pathname;
  const downloadUrl = `https://github.com${repoPath}/archive/refs/heads/main.zip`;

  console.log(`Attempting to download repo zip from: ${downloadUrl}`);

  try {
    const headers = githubToken ? { Authorization: `token ${githubToken}` } : {};
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer', headers });
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

// --- Apply Refactored Handlers with JWT Protection ---
app.post('/api/generate-docs', generateDocsHandler);
app.post('/api/upload-generate-docs', upload.array('codeFiles'), uploadGenerateDocsHandler);
app.post('/api/github-repo-docs', githubRepoDocsHandler);

// API endpoint for code search
app.get('/api/code-search', async (req: Request, res: any) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const topResults = await codeSearch(query); // make sure codeSearch is defined
    return res.json({ results: topResults });
  } catch (error: any) {
    console.error('Error searching code:', error);
    return res.status(500).json({ error: 'Failed to search code' });
  }
});

// Call indexCodebase on startup
indexCodebase('./');

// Listen on all network interfaces, crucial for deployment environments like Render
app.listen(portNumber, '0.0.0.0', () => {
  console.log(`[server]: Server listening on port ${portNumber}`);
});
// Removed startServer function and globalErrorHandler
