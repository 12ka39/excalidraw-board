import React, { useEffect, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { io } from 'socket.io-client';
import Toast from './Toast';
import { generateNickname } from '../utils/nicknameGenerator';

const socket = io('http://localhost:3000');

const CollaborativeExcalidraw = ({ roomId, excalidrawAPI, setExcalidrawAPI }) => {
  const [collaborators, setCollaborators] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedElements, setLastReceivedElements] = useState(null);
  const [toast, setToast] = useState(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // 컴포넌트 마운트 시 닉네임 생성
    setNickname(generateNickname());
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!roomId) return;

    socket.on('connect', () => {
      setIsConnected(true);
      const generatedNickname = generateNickname(); // 닉네임 생성
      setNickname(generatedNickname);
      console.log('Socket connected, joining room:', roomId, 'with nickname:', generatedNickname);
      socket.emit('joinRoom', { roomId, nickname: generatedNickname }); // 닉네임 전송
      showToast('서버에 연결되었습니다', 'success');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      showToast('서버와의 연결이 끊어졌습니다', 'error');
    });

    socket.on('canvasState', (elements) => {
      console.log('Received initial canvas state');
      if (excalidrawAPI && elements) {
        setLastReceivedElements(elements);
        excalidrawAPI.updateScene({ elements });
      }
    });

    socket.on('elementsUpdated', (data) => {
      if (excalidrawAPI && data.elements) {
        if (data.userId !== socket.id) {
          setLastReceivedElements(data.elements);
          excalidrawAPI.updateScene({ elements: data.elements });
          showToast(`${data.nickname || '익명'}님이 그림을 수정했습니다`, 'info');
        }
      }
    });

    socket.on('userJoined', (data) => {
      console.log('User joined:', data);
      showToast(`${data.nickname}님이 입장했습니다`, 'info');
    });

    socket.on('pointerUpdated', ({ userId, pointer, nickname }) => {
      setCollaborators(prev => new Map(prev.set(userId, { pointer, nickname })));
    });

    socket.on('userLeft', (data) => {
      console.log('User left:', data);
      setCollaborators(prev => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
      showToast(`${data.nickname}님이 퇴장했습니다`, 'warning');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('canvasState');
      socket.off('elementsUpdated');
      socket.off('userJoined');
      socket.off('pointerUpdated');
      socket.off('userLeft');
    };
  }, [roomId, excalidrawAPI, nickname]);

  const onChange = useCallback((elements) => {
    if (!roomId || !isConnected) return;

    if (JSON.stringify(elements) !== JSON.stringify(lastReceivedElements)) {
      console.log('Sending elements update');
      socket.emit('updateElements', { roomId, elements, nickname });
      setLastReceivedElements(elements);
    }
  }, [roomId, isConnected, lastReceivedElements, nickname]);

  const onPointerUpdate = useCallback(({ x, y }) => {
    if (!roomId || !isConnected) return;

    socket.emit('pointerUpdate', {
      roomId,
      pointer: { x, y },
      nickname
    });
  }, [roomId, isConnected, nickname]);

  return (
      <div className="border border-purple-100 rounded-lg" style={{ height: '60vh' }}>
        <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            onChange={onChange}
            onPointerUpdate={onPointerUpdate}
            collaborators={Array.from(collaborators.entries()).map(([id, data]) => ({
              id,
              pointer: data.pointer,
              username: data.nickname || `User ${id.slice(0, 4)}`,
              color: { background: '#ffcce5', stroke: '#ff99cc' }
            }))}
        />
        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )}
      </div>
  );
};

export default CollaborativeExcalidraw;
