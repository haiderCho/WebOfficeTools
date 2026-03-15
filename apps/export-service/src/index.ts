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

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

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
  const { content, from, to, filename, assets } = req.body;

  if (!content || !from || !to) {
    return res.status(400).json({ error: 'Missing required fields: content, from, to' });
  }

  const id = nanoid();
  const workDir = path.join(TEMP_DIR, `job_${id}`);
  const inputFileName = `input.${from === 'markdown' ? 'md' : from}`;
  const outputFileName = `output.${to}`;
  const inputPath = path.join(workDir, inputFileName);
  const outputPath = path.join(workDir, outputFileName);

  try {
    await fs.mkdir(workDir, { recursive: true });

    // Write asset images to the work directory so Pandoc can find them
    let processedContent = content;
    if (assets && Array.isArray(assets) && assets.length > 0) {
      for (const asset of assets) {
        if (!asset.name || !asset.data) continue;

        // Extract base64 data (strip "data:image/png;base64," prefix)
        const base64Match = asset.data.match(/^data:[^;]+;base64,(.+)$/);
        if (!base64Match) continue;

        const imgBuffer = Buffer.from(base64Match[1], 'base64');
        const imgPath = path.join(workDir, asset.name);
        await fs.writeFile(imgPath, imgBuffer);

        // Replace asset:filename references with the local file path
        processedContent = processedContent.replace(
          new RegExp(`asset:${escapeRegex(asset.name)}`, 'g'),
          asset.name
        );
      }
    }

    // Write input content to temp file
    await fs.writeFile(inputPath, processedContent);

    // Execute pandoc from the work directory so relative image paths resolve
    const command = `pandoc "${inputFileName}" -V geometry:margin=1in -o "${outputFileName}"`;
    console.log(`Executing in ${workDir}: ${command}`);

    await execAsync(command, { cwd: workDir });

    // Send the converted file
    const fileBuffer = await fs.readFile(outputPath);
    
    res.setHeader('Content-Type', getContentType(to));
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document'}.${to}"`);
    res.send(fileBuffer);

    // Cleanup entire work directory
    await rimraf(workDir);

  } catch (error: any) {
    console.error('Conversion failed:', error);
    res.status(500).json({ 
      error: 'Conversion failed', 
      details: error.message 
    });
    
    // Attempt cleanup
    try { await rimraf(workDir); } catch (e) {}
  }
});

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
