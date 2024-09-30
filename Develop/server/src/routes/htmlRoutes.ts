import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

console.log(__dirname);

// TODO: Define route to serve index.html

router.get('/', (_req, res) => {
    const indexPath = path.join(__dirname, '../../Develop/client/index.html');
    res.sendFile(indexPath);
  });

export default router;
