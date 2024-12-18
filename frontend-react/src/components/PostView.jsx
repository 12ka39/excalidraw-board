import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
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
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPost();
  }, [id]);

  if (error) {
    return (
        <div className="p-4 text-red-600">
          {error}
        </div>
    );
  }

  if (!post) {
    return (
        <div className="p-4">
          로딩 중...
        </div>
    );
  }

  return (
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors"
            >
              목록으로
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
              <div className="flex justify-between text-sm text-gray-600">
                <span>작성자: {post.author}</span>
                <div>
                  <span className="mr-4">조회수: {post.views}</span>
                  <span>작성일: {post.date}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-100" style={{ height: '60vh' }}>
            <Excalidraw
                initialData={{
                  elements: post.content.elements,
                  appState: {
                    viewModeEnabled: true,
                    zenModeEnabled: false,
                    gridSize: null,
                    theme: "light"
                  }
                }}
                viewModeEnabled
            />
          </div>
        </div>
      </div>
  );
};

export default PostView;
