import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { handleJsonCrud } from './jsoncrud.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3000;

try {
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));  // JSON 크기 제한 설정

  // 정적 파일 제공 경로를 절대 경로로 수정
  const frontendPath = join(__dirname, '..', 'frontend');
  app.use(express.static(frontendPath));

  // API 라우트
  app.get('/api/drawings', async (req, res) => {
    try {
      const drawings = await handleJsonCrud.getDrawings();
      res.json(drawings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend files being served from: ${frontendPath}`);
  });
} catch (error) {
  console.error('Server initialization failed:', error);
  process.exit(1);
}
