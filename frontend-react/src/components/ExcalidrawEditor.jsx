import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CollaborativeExcalidraw from './CollaborativeExcalidraw';
import { v4 as uuidv4 } from 'uuid'; // uuid를 설치해야 합니다: npm install uuid

const ExcalidrawEditor = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(roomId || uuidv4());

  useEffect(() => {
    // URL에 roomId가 없으면 새로 생성하고 URL 업데이트
    if (!roomId) {
      navigate(`/write/${currentRoomId}`, { replace: true });
    }
  }, [roomId, currentRoomId, navigate]);

  const handleSave = async () => {
    if (!excalidrawAPI) return;
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!author.trim()) {
      alert('글쓴이를 입력해주세요.');
      return;
    }

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();

      const response = await fetch('/api/posts', {
        method: 'POST',
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

      if (response.ok) {
        alert('저장되었습니다!');
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors"
            >
              목록으로
            </button>
            <div className="text-sm text-purple-600">
              Room ID: {currentRoomId}
            </div>
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

          <CollaborativeExcalidraw
              roomId={currentRoomId}
              excalidrawAPI={excalidrawAPI}
              setExcalidrawAPI={setExcalidrawAPI}
          />

          <div className="flex justify-end mt-4">
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
            >
              저장
            </button>
          </div>
        </div>
      </div>
  );
};

export default ExcalidrawEditor;
