import React, { useEffect, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { io } from 'socket.io-client';
import Toast from './Toast';

const socket = io('http://localhost:3000');

const CollaborativeExcalidraw = ({ roomId, excalidrawAPI, setExcalidrawAPI }) => {
  const [collaborators, setCollaborators] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedElements, setLastReceivedElements] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!roomId) return;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected, joining room:', roomId);
      socket.emit('joinRoom', roomId);
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
      console.log('Received elements update');
      if (excalidrawAPI && data.elements) {
        if (data.userId !== socket.id) {
          setLastReceivedElements(data.elements);
          excalidrawAPI.updateScene({ elements: data.elements });
          showToast(`${data.userId.slice(0, 4)}님이 그림을 수정했습니다`, 'info');
        }
      }
    });

    socket.on('userJoined', (userId) => {
      console.log(`사용자 ${userId}가 참가함`);
      showToast(`${userId.slice(0, 4)}님이 입장했습니다`, 'info');
    });

    socket.on('pointerUpdated', ({ userId, pointer }) => {
      setCollaborators(prev => new Map(prev.set(userId, pointer)));
    });

    socket.on('userLeft', (userId) => {
      console.log('User left:', userId);
      setCollaborators(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
      showToast(`${userId.slice(0, 4)}님이 퇴장했습니다`, 'warning');
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
  }, [roomId, excalidrawAPI]);

  const onChange = useCallback((elements) => {
    if (!roomId || !isConnected) return;

    if (JSON.stringify(elements) !== JSON.stringify(lastReceivedElements)) {
      console.log('Sending elements update');
      socket.emit('updateElements', { roomId, elements });
      setLastReceivedElements(elements);
    }
  }, [roomId, isConnected, lastReceivedElements]);

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

// import React, { useEffect, useState, useCallback } from 'react';
// import { Excalidraw } from '@excalidraw/excalidraw';
// import { io } from 'socket.io-client';
//
// const socket = io('http://localhost:3000');
//
// const CollaborativeExcalidraw = ({ roomId, excalidrawAPI, setExcalidrawAPI }) => {
//   const [collaborators, setCollaborators] = useState(new Map());
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastReceivedElements, setLastReceivedElements] = useState(null);
//
//   // 소켓 연결 및 이벤트 핸들러 설정
//   useEffect(() => {
//     if (!roomId) return;
//
//     // 소켓 연결 상태 관리
//     socket.on('connect', () => {
//       setIsConnected(true);
//       console.log('Socket connected, joining room:', roomId);
//       socket.emit('joinRoom', roomId);
//     });
//
//     socket.on('disconnect', () => {
//       console.log('Socket disconnected');
//       setIsConnected(false);
//     });
//
//     // 초기 캔버스 상태 수신
//     socket.on('canvasState', (elements) => {
//       console.log('Received initial canvas state');
//       if (excalidrawAPI && elements) {
//         setLastReceivedElements(elements);
//         excalidrawAPI.updateScene({ elements });
//       }
//     });
//
//     // 다른 사용자의 그리기 요소 업데이트 수신
//     socket.on('elementsUpdated', (data) => {
//       console.log('Received elements update');
//       if (excalidrawAPI && data.elements) {
//         // 자신이 보낸 업데이트가 아닐 때만 적용
//         if (data.userId !== socket.id) {
//           setLastReceivedElements(data.elements);
//           excalidrawAPI.updateScene({ elements: data.elements });
//         }
//       }
//     });
//     // socket.on('elementsUpdated', (elements) => {
//     //   console.log('Received elements update');
//     //   if (excalidrawAPI && elements) {
//     //     setLastReceivedElements(elements);
//     //     excalidrawAPI.updateScene({ elements });
//     //   }
//     // });
//
//     // 다른 사용자 참가
//     socket.on('userJoined', (userId) => {
//       console.log(`사용자 ${userId}가 참가함`);
//     });
//
//     // 포인터 업데이트 수신
//     socket.on('pointerUpdated', ({ userId, pointer }) => {
//       setCollaborators(prev => new Map(prev.set(userId, pointer)));
//     });
//
//     // 사용자 퇴장 처리
//     socket.on('userLeft', (userId) => {
//       console.log('User left:', userId);
//       setCollaborators(prev => {
//         const next = new Map(prev);
//         next.delete(userId);
//         return next;
//       });
//     });
//
//     // 클린업 함수
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('canvasState');
//       socket.off('elementsUpdated');
//       socket.off('userJoined');
//       socket.off('pointerUpdated');
//       socket.off('userLeft');
//     };
//   }, [roomId, excalidrawAPI]);
//
//   // 그리기 요소 변경 처리
//   const onChange = useCallback((elements) => {
//     if (!roomId || !isConnected) return;
//
//     // 마지막으로 받은 요소와 현재 요소가 다를 때만 업데이트 전송
//     if (JSON.stringify(elements) !== JSON.stringify(lastReceivedElements)) {
//       console.log('Sending elements update');
//       socket.emit('updateElements', { roomId, elements });
//       setLastReceivedElements(elements); // 마지막으로 보낸 요소 업데이트
//     }
//   }, [roomId, isConnected, lastReceivedElements]);
//
//
//   // 포인터 위치 업데이트 처리
//   const onPointerUpdate = useCallback(({ x, y }) => {
//     if (!roomId || !isConnected) return;
//
//     socket.emit('pointerUpdate', {
//       roomId,
//       pointer: { x, y }
//     });
//   }, [roomId, isConnected]);
//
//   return (
//       <div className="border border-purple-100 rounded-lg" style={{ height: '60vh' }}>
//         <Excalidraw
//             excalidrawAPI={(api) => setExcalidrawAPI(api)}
//             onChange={onChange}
//             onPointerUpdate={onPointerUpdate}
//             collaborators={Array.from(collaborators.entries()).map(([id, pointer]) => ({
//               id,
//               pointer,
//               username: `User ${id.slice(0, 4)}`, // 사용자 ID의 첫 4자리를 이름으로 사용
//               color: { background: '#ffcce5', stroke: '#ff99cc' } // 협업자 포인터 색상
//             }))}
//         />
//       </div>
//   );
// };
//
// export default CollaborativeExcalidraw;
