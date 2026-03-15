import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { rimraf } from 'rimraf';

const execAsync = promisify(exec);
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create temp directory:', err);
  }
}

app.post('/convert', async (req, res) => {
  const { content, from, to, filename } = req.body;

  if (!content || !from || !to) {
    return res.status(400).json({ error: 'Missing required fields: content, from, to' });
  }

  const id = nanoid();
  const inputFileName = `input_${id}.${from === 'markdown' ? 'md' : from}`;
  const outputFileName = `${filename || 'document'}_${id}.${to}`;
  const inputPath = path.join(TEMP_DIR, inputFileName);
  const outputPath = path.join(TEMP_DIR, outputFileName);

  try {
    await ensureTempDir();
    
    // Write input content to temp file
    await fs.writeFile(inputPath, content);

    // Execute pandoc
    // Basic command: pandoc input.md -o output.docx
    const command = `pandoc "${inputPath}" -o "${outputPath}"`;
    console.log(`Executing: ${command}`);
    
    await execAsync(command);

    // Send the converted file
    const fileBuffer = await fs.readFile(outputPath);
    
    res.setHeader('Content-Type', getContentType(to));
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document'}.${to}"`);
    res.send(fileBuffer);

    // Cleanup
    await rimraf(inputPath);
    await rimraf(outputPath);

  } catch (error: any) {
    console.error('Conversion failed:', error);
    res.status(500).json({ 
      error: 'Conversion failed', 
      details: error.message 
    });
    
    // Attempt cleanup
    try {
      await rimraf(inputPath);
      await rimraf(outputPath);
    } catch (e) {}
  }
});

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    html: 'text/html',
    md: 'text/markdown',
    txt: 'text/plain',
    csv: 'text/csv'
  };
  return types[ext] || 'application/octet-stream';
}

app.listen(port, () => {
  console.log(`Export service listening at http://localhost:${port}`);
});
