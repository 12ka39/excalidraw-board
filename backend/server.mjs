// server.mjs
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// HTTP 서버 생성
const httpServer = createServer(app);

// Socket.IO 서버 생성
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite 기본 포트
    methods: ["GET", "POST"]
  }
});

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
    const { title, author, content } = req.body;
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const { posts, lastId } = JSON.parse(data);

    const newPost = {
      id: lastId + 1,
      title,
      author,
      views: 0,
      date: new Date().toLocaleDateString(),
      content: {
        elements: content.elements,
        appState: content.appState
      }
    };

    posts.unshift(newPost);

    await fs.writeFile(POSTS_FILE, JSON.stringify({
      posts,
      lastId: newPost.id
    }, null, 2));

    res.status(201).json(newPost);
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    res.status(500).json({ error: '게시글 작성에 실패했습니다.' });
  }
});

// 게시글 수정
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, content } = req.body;
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const { posts } = JSON.parse(data);

    const postIndex = posts.findIndex(p => p.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      title,
      author,
      content: {
        elements: content.elements,
        appState: content.appState
      },
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(POSTS_FILE, JSON.stringify({ posts, lastId: posts[0]?.id || 0 }, null, 2));
    res.json(posts[postIndex]);
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    res.status(500).json({ error: '게시글 수정에 실패했습니다.' });
  }
});

// 게시글 삭제
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const { posts } = JSON.parse(data);

    const postIndex = posts.findIndex(p => p.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    posts.splice(postIndex, 1);

    await fs.writeFile(POSTS_FILE, JSON.stringify({
      posts,
      lastId: posts[0]?.id || 0
    }, null, 2));

    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    res.status(500).json({ error: '게시글 삭제에 실패했습니다.' });
  }
});

// 웹소켓 이벤트 처리
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('사용자 연결됨:', socket.id);

  // 방 참가
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`사용자 ${socket.id}가 방 ${roomId}에 참가함`);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        elements: []
      });
    }

    const room = rooms.get(roomId);
    room.users.add(socket.id);

    socket.emit('canvasState', room.elements);
    socket.to(roomId).emit('userJoined', socket.id);
  });

  // 그리기 요소 업데이트
  socket.on('updateElements', ({ roomId, elements }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.elements = elements;
      socket.to(roomId).emit('elementsUpdated', elements);
    }
  });

  // 포인터 위치 업데이트
  socket.on('pointerUpdate', ({ roomId, pointer }) => {
    socket.to(roomId).emit('pointerUpdated', {
      userId: socket.id,
      pointer
    });
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log('사용자 연결 해제됨:', socket.id);

    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        io.to(roomId).emit('userLeft', socket.id);

        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

// 서버 초기화 및 시작
async function startServer() {
  await ensureDataDir();
  await initializePostsFile();

  httpServer.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

startServer().catch(console.error);

// // server.mjs
// import express from 'express';
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import httpServer from './socket.mjs';
//
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const app = express();
// const PORT = 3000;
//
// // JSON 파일 경로 설정
// const DATA_DIR = path.join(__dirname, 'data');
// const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
//
// // 미들웨어 설정
// app.use(express.json());
//
// // 데이터 디렉토리 생성 함수
// async function ensureDataDir() {
//   try {
//     await fs.access(DATA_DIR);
//   } catch {
//     await fs.mkdir(DATA_DIR, { recursive: true });
//   }
// }
//
// // posts.json 파일 초기화 함수
// async function initializePostsFile() {
//   try {
//     await fs.access(POSTS_FILE);
//   } catch {
//     await fs.writeFile(POSTS_FILE, JSON.stringify({ posts: [], lastId: 0 }));
//   }
// }
//
// // 게시글 목록 조회
// app.get('/api/posts', async (req, res) => {
//   try {
//     const data = await fs.readFile(POSTS_FILE, 'utf-8');
//     const { posts } = JSON.parse(data);
//     res.json(posts);
//   } catch (error) {
//     console.error('게시글 목록 조회 오류:', error);
//     res.status(500).json({ error: '게시글 목록을 불러오는데 실패했습니다.' });
//   }
// });
//
// // 게시글 상세 조회
// app.get('/api/posts/:id', async (req, res) => {
//   try {
//     const data = await fs.readFile(POSTS_FILE, 'utf-8');
//     const { posts } = JSON.parse(data);
//     const post = posts.find(p => p.id === parseInt(req.params.id));
//
//     if (!post) {
//       return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
//     }
//
//     // 조회수 증가
//     post.views += 1;
//     await fs.writeFile(POSTS_FILE, JSON.stringify({ posts, lastId: posts[0]?.id || 0 }));
//
//     res.json(post);
//   } catch (error) {
//     console.error('게시글 조회 오류:', error);
//     res.status(500).json({ error: '게시글을 불러오는데 실패했습니다.' });
//   }
// });
//
// // 게시글 작성
// app.post('/api/posts', async (req, res) => {
//   try {
//     const { title, author, content } = req.body;
//     const data = await fs.readFile(POSTS_FILE, 'utf-8');
//     const { posts, lastId } = JSON.parse(data);
//
//     const newPost = {
//       id: lastId + 1,
//       title,
//       author,
//       views: 0,
//       date: new Date().toLocaleDateString(),
//       content: {
//         elements: content.elements,
//         appState: content.appState
//       }
//     };
//
//     posts.unshift(newPost); // 새 게시글을 배열 맨 앞에 추가
//
//     await fs.writeFile(POSTS_FILE, JSON.stringify({
//       posts,
//       lastId: newPost.id
//     }, null, 2)); // null, 2를 추가하여 JSON을 보기 좋게 포맷팅
//
//     res.status(201).json(newPost);
//   } catch (error) {
//     console.error('게시글 작성 오류:', error);
//     res.status(500).json({ error: '게시글 작성에 실패했습니다.' });
//   }
// });
//
//
// // 게시글 수정
// app.put('/api/posts/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, author, content } = req.body;
//     const data = await fs.readFile(POSTS_FILE, 'utf-8');
//     const { posts } = JSON.parse(data);
//
//     const postIndex = posts.findIndex(p => p.id === parseInt(id));
//     if (postIndex === -1) {
//       return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
//     }
//
//     // 기존 게시글의 정보를 유지하면서 새로운 정보로 업데이트
//     posts[postIndex] = {
//       ...posts[postIndex],
//       title,
//       author,
//       content: {
//         elements: content.elements,
//         appState: content.appState
//       },
//       updatedAt: new Date().toISOString() // 수정 시간 추가
//     };
//
//     await fs.writeFile(POSTS_FILE, JSON.stringify({ posts, lastId: posts[0]?.id || 0 }, null, 2));
//     res.json(posts[postIndex]);
//   } catch (error) {
//     console.error('게시글 수정 오류:', error);
//     res.status(500).json({ error: '게시글 수정에 실패했습니다.' });
//   }
// });
//
//
// // 게시글 삭제
// app.delete('/api/posts/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = await fs.readFile(POSTS_FILE, 'utf-8');
//     const { posts } = JSON.parse(data);
//
//     const postIndex = posts.findIndex(p => p.id === parseInt(id));
//     if (postIndex === -1) {
//       return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
//     }
//
//     // 게시글 삭제
//     posts.splice(postIndex, 1);
//
//     // 파일 업데이트
//     await fs.writeFile(POSTS_FILE, JSON.stringify({
//       posts,
//       lastId: posts[0]?.id || 0
//     }, null, 2));
//
//     res.json({ message: '게시글이 삭제되었습니다.' });
//   } catch (error) {
//     console.error('게시글 삭제 오류:', error);
//     res.status(500).json({ error: '게시글 삭제에 실패했습니다.' });
//   }
// });
//
//
// // 서버 초기화 및 시작
// async function startServer() {
//   await ensureDataDir();
//   await initializePostsFile();
//
//   app.listen(PORT, () => {
//     console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
//   });
// }
//
//
// // Express 앱을 HTTP 서버에 연결
// httpServer.listen(PORT, () => {
//   console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
// });
//
// startServer().catch(console.error);
