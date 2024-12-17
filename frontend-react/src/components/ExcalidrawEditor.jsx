import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';

const ExcalidrawEditor = () => {
  const navigate = useNavigate();
  const excalidrawRef = useRef(null);

  const handleSave = async () => {
    if (!excalidrawRef.current) return;

    try {
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();

      const response = await fetch('/api/drawings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements,
          appState,
        }),
      });

      if (response.ok) {
        alert('저장되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
    }
  };

  return (
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors inline-block"
            >
              목록으로
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-purple-100" style={{ height: '70vh' }}>
            <Excalidraw
                ref={excalidrawRef}
                onChange={(elements, state) => {
                  console.log("변경된 요소들:", elements);
                  console.log("앱 상태:", state);
                }}
            />
          </div>
          <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm fixed bottom-4 right-4"
          >
            저장
          </button>
        </div>
      </div>
  );
};

export default ExcalidrawEditor;
