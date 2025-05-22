import express, { Request, Response } from 'express';
import { analyzeCodeSecurity } from '../services/securityService';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const analysisResult = await analyzeCodeSecurity(code);
    res.status(200).json({ result: analysisResult });
  } catch (error: any) {
    console.error('Error analyzing code security:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
