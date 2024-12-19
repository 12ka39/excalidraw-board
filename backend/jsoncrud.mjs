import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAWINGS_FILE = path.join(__dirname, '..', 'data', 'drawings.json');

// 디렉토리가 없으면 생성하는 유틸리티 함수
async function ensureDirectoryExists(filePath) {
  try {
    await fs.access(path.dirname(filePath));
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }
}

export const handleJsonCrud = {
  async getDrawings() {
    try {
      await ensureDirectoryExists(DRAWINGS_FILE);
      const data = await fs.readFile(DRAWINGS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 파일이 없으면 빈 배열 반환
        return [];
      }
      throw error;
    }
  },

  async saveDrawing(data) {
    try {
      await ensureDirectoryExists(DRAWINGS_FILE);
      const drawings = await this.getDrawings();
      const newDrawing = {
        id: Date.now(), // 고유 ID 생성
        ...data,
        createdAt: new Date().toISOString()
      };

      drawings.push(newDrawing);
      await fs.writeFile(DRAWINGS_FILE, JSON.stringify(drawings, null, 2));
      return newDrawing;
    } catch (error) {
      console.error('Drawing save error:', error);
      throw new Error('Failed to save drawing');
    }
  }
};
