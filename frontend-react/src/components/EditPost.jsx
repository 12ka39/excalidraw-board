import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [post, setPost] = useState(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setPost(data);
        setTitle(data.title);
        setAuthor(data.author);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async () => {
    if (!excalidrawAPI || !title.trim() || !author.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          author,
          content: {
            elements,
            appState
          }
        }),
      });

      if (!response.ok) {
        throw new Error('게시글 수정에 실패했습니다.');
      }

      alert('수정되었습니다!');
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
      alert(error.message);
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <button
                onClick={() => navigate(`/post/${id}`)}
                className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              돌아가기
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <label htmlFor="title" className="w-24 text-gray-700">제목:</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="제목을 입력하세요"
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="author" className="w-24 text-gray-700">글쓴이:</label>
                <input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="글쓴이를 입력하세요"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-100" style={{ height: '60vh' }}>
            {post && (
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={{
                      elements: post.content.elements,
                      appState: {
                        viewModeEnabled: false,
                        zenModeEnabled: false,
                        gridSize: null,
                        theme: "light"
                      }
                    }}
                />
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
              수정완료
            </button>
          </div>
        </div>
      </div>
  );
};

export default EditPost;
