// server.mjs
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// JSON 파일 경로 설정
const DATA_DIR = path.join(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// 미들웨어 설정
app.use(express.json());

// 데이터 디렉토리 생성 함수
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// posts.json 파일 초기화 함수
async function initializePostsFile() {
  try {
    await fs.access(POSTS_FILE);
  } catch {
    await fs.writeFile(POSTS_FILE, JSON.stringify({ posts: [], lastId: 0 }));
  }
}

// 게시글 목록 조회
app.get('/api/posts', async (req, res) => {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const { posts } = JSON.parse(data);
    res.json(posts);
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    res.status(500).json({ error: '게시글 목록을 불러오는데 실패했습니다.' });
  }
});

// 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const { posts } = JSON.parse(data);
    const post = posts.find(p => p.id === parseInt(req.params.id));

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    post.views += 1;
    await fs.writeFile(POSTS_FILE, JSON.stringify({ posts, lastId: posts[0]?.id || 0 }));

    res.json(post);
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({ error: '게시글을 불러오는데 실패했습니다.' });
  }
});

// 게시글 작성
app.post('/api/posts', async (req, res) => {
  try {
    const { title, author, elements, appState } = req.body;
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const { posts, lastId } = JSON.parse(data);

    const newPost = {
      id: lastId + 1,
      title,
      author,
      views: 0,
      date: new Date().toLocaleDateString(),
      content: {
        elements,
        appState
      }
    };

    posts.unshift(newPost); // 새 게시글을 배열 맨 앞에 추가

    await fs.writeFile(POSTS_FILE, JSON.stringify({
      posts,
      lastId: newPost.id
    }));

    res.status(201).json(newPost);
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    res.status(500).json({ error: '게시글 작성에 실패했습니다.' });
  }
});

// 서버 초기화 및 시작
async function startServer() {
  await ensureDataDir();
  await initializePostsFile();

  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

startServer().catch(console.error);

// import express from 'express';
// import cors from 'cors';
// import { dirname, join } from 'path';
// import { fileURLToPath } from 'url';
// import { handleJsonCrud } from './jsoncrud.mjs';
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
//
// const app = express();
// const PORT = process.env.PORT ?? 3000;
//
// try {
//   app.use(cors());
//   app.use(express.json({ limit: '50mb' }));  // JSON 크기 제한 설정
//
//   const frontendPath = join(__dirname, '..', 'frontend');
//   app.use(express.static(frontendPath));
//
//   // editor 경로 추가
//   app.get('/editor', (req, res) => {
//     res.sendFile(join(frontendPath, 'editor.html'));
//   });
//
//   // GET: 모든 그림 조회
//   app.get('/api/drawings', async (req, res) => {
//     try {
//       const drawings = await handleJsonCrud.getDrawings();
//       res.json(drawings);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
//
//   // POST: 새 그림 저장
//   app.post('/api/drawings', async (req, res) => {
//     try {
//       const newDrawing = await handleJsonCrud.saveDrawing(req.body);
//       res.status(201).json(newDrawing);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
//
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Frontend files being served from: ${frontendPath}`);
//   });
// } catch (error) {
//   console.error('Server initialization failed:', error);
//   process.exit(1);
// }
