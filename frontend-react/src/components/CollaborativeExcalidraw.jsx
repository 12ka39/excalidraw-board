import React, { useEffect, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const CollaborativeExcalidraw = ({ roomId, excalidrawAPI, setExcalidrawAPI }) => {
  const [collaborators, setCollaborators] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // 소켓 연결 및 이벤트 핸들러 설정
  useEffect(() => {
    if (!roomId) return;

    // 소켓 연결 상태 관리
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected, joining room:', roomId);
      socket.emit('joinRoom', roomId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // 초기 캔버스 상태 수신
    socket.on('canvasState', (elements) => {
      console.log('Received initial canvas state');
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({ elements });
      }
    });

    // 다른 사용자의 그리기 요소 업데이트 수신
    socket.on('elementsUpdated', (elements) => {
      console.log('Received elements update');
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({ elements });
      }
    });

    // 포인터 업데이트 수신
    socket.on('pointerUpdated', ({ userId, pointer }) => {
      setCollaborators(prev => new Map(prev.set(userId, pointer)));
    });

    // 사용자 퇴장 처리
    socket.on('userLeft', (userId) => {
      console.log('User left:', userId);
      setCollaborators(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    // 클린업 함수
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('canvasState');
      socket.off('elementsUpdated');
      socket.off('pointerUpdated');
      socket.off('userLeft');
    };
  }, [roomId, excalidrawAPI]);

  // 그리기 요소 변경 처리
  const onChange = useCallback((elements) => {
    if (!roomId || !isConnected) return;
    console.log('Sending elements update');
    socket.emit('updateElements', { roomId, elements });
  }, [roomId, isConnected]);

  // 포인터 위치 업데이트 처리
  const onPointerUpdate = useCallback(({ x, y }) => {
    if (!roomId || !isConnected) return;
    socket.emit('pointerUpdate', {
      roomId,
      pointer: { x, y }
    });
  }, [roomId, isConnected]);

  return (
      <div className="border border-purple-100 rounded-lg" style={{ height: '60vh' }}>
        <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            onChange={onChange}
            onPointerUpdate={onPointerUpdate}
            collaborators={Array.from(collaborators.entries()).map(([id, pointer]) => ({
              id,
              pointer,
              username: `User ${id.slice(0, 4)}`,
              color: { background: '#ffcce5', stroke: '#ff99cc' }
            }))}
        />
      </div>
  );
};

export default CollaborativeExcalidraw;
