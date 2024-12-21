import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { io } from 'socket.io-client';
import Toast from './Toast';
import { generateNickname } from '../utils/nicknameGenerator';
import ChatWindow from "./ChatWindow.jsx";

const CollaborativeExcalidraw = ({ roomId, excalidrawAPI, setExcalidrawAPI }) => {
  const socketRef = useRef(null);
  const [collaborators, setCollaborators] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedElements, setLastReceivedElements] = useState(null);
  const [toast, setToast] = useState(null);
  const [nickname, setNickname] = useState('');
  const lastBroadcastedElements = useRef(null); // 마지막으로 브로드캐스트한 elements 추적
  const updateTimeoutRef = useRef(null); // 디바운스를 위한 timeout ref

  // 컴포넌트 마운트시 socket 초기화
  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false
    });
    setNickname(generateNickname());

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    if (!socketRef.current || !roomId || !nickname) return;

    const socket = socketRef.current;

    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected, joining room:', roomId, 'with nickname:', nickname);
      socket.emit('joinRoom', { roomId, nickname });
      showToast('서버에 연결되었습니다', 'success');
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      showToast('서버와의 연결이 끊어졌습니다', 'error');
    };

    const handleCanvasState = (elements) => {
      console.log('Received initial canvas state');
      if (excalidrawAPI && elements) {
        setLastReceivedElements(elements);
        lastBroadcastedElements.current = elements;
        excalidrawAPI.updateScene({ elements });
      }
    };

    const handleElementsUpdated = (data) => {
      if (excalidrawAPI && data.elements) {
        if (data.userId !== socket.id) {
          const stringifiedCurrentElements = JSON.stringify(lastReceivedElements || []);
          const stringifiedNewElements = JSON.stringify(data.elements);

          if (stringifiedCurrentElements !== stringifiedNewElements) {
            setLastReceivedElements(data.elements);
            lastBroadcastedElements.current = data.elements;
            excalidrawAPI.updateScene({ elements: data.elements });
            showToast(`${data.nickname || '익명'}님이 그림을 수정했습니다`, 'info');
          }
        }
      }
    };

    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      showToast(`${data.nickname}님이 입장했습니다`, 'info');
    };

    const handlePointerUpdated = ({ userId, pointer, nickname }) => {
      setCollaborators(prev => new Map(prev.set(userId, { pointer, nickname })));
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data);
      setCollaborators(prev => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
      showToast(`${data.nickname}님이 퇴장했습니다`, 'warning');
    };

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('canvasState', handleCanvasState);
    socket.on('elementsUpdated', handleElementsUpdated);
    socket.on('userJoined', handleUserJoined);
    socket.on('pointerUpdated', handlePointerUpdated);
    socket.on('userLeft', handleUserLeft);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('canvasState', handleCanvasState);
      socket.off('elementsUpdated', handleElementsUpdated);
      socket.off('userJoined', handleUserJoined);
      socket.off('pointerUpdated', handlePointerUpdated);
      socket.off('userLeft', handleUserLeft);
    };
  }, [roomId, excalidrawAPI, nickname]);

  const onChange = useCallback((elements) => {
    if (!socketRef.current || !roomId || !isConnected || !elements) return;

    // 이전 타임아웃 클리어
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // 디바운스된 업데이트 실행
    updateTimeoutRef.current = setTimeout(() => {
      const stringifiedLastElements = JSON.stringify(lastBroadcastedElements.current || []);
      const stringifiedNewElements = JSON.stringify(elements);

      if (stringifiedLastElements !== stringifiedNewElements) {
        console.log('Sending elements update');
        socketRef.current.emit('updateElements', { roomId, elements, nickname });
        lastBroadcastedElements.current = elements;
        setLastReceivedElements(elements);
      }
    }, 30); // 30ms 디바운스
  }, [roomId, isConnected, nickname]);

  const onPointerUpdate = useCallback(({ x, y }) => {
    if (!socketRef.current || !roomId || !isConnected) return;

    socketRef.current.emit('pointerUpdate', {
      roomId,
      pointer: { x, y },
      nickname
    });
  }, [roomId, isConnected, nickname]);

  return (
      <div className="relative">
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

        <ChatWindow
            key={roomId}
            roomId={roomId}
            socket={socketRef.current}
            nickname={nickname}
        />
      </div>
  );
};

export default CollaborativeExcalidraw;


// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { Excalidraw } from '@excalidraw/excalidraw';
// import { io } from 'socket.io-client';
// import Toast from './Toast';
// import { generateNickname } from '../utils/nicknameGenerator';
// import ChatWindow from "./ChatWindow.jsx";
//
// const CollaborativeExcalidraw = ({ roomId, excalidrawAPI, setExcalidrawAPI }) => {
//   const socketRef = useRef(null);
//   const [collaborators, setCollaborators] = useState(new Map());
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastReceivedElements, setLastReceivedElements] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [nickname, setNickname] = useState('');
//
//   // 컴포넌트 마운트시 socket 초기화
//   useEffect(() => {
//     socketRef.current = io('http://localhost:3000');
//     setNickname(generateNickname());
//
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);
//
//   const showToast = (message, type = 'info') => {
//     setToast({ message, type });
//   };
//
//   // 소켓 연결 및 이벤트 리스너 설정
//   useEffect(() => {
//     if (!socketRef.current || !roomId || !nickname) return;
//
//     const socket = socketRef.current;
//
//     const handleConnect = () => {
//       setIsConnected(true);
//       console.log('Socket connected, joining room:', roomId, 'with nickname:', nickname);
//       socket.emit('joinRoom', { roomId, nickname });
//       showToast('서버에 연결되었습니다', 'success');
//     };
//
//     const handleDisconnect = () => {
//       console.log('Socket disconnected');
//       setIsConnected(false);
//       showToast('서버와의 연결이 끊어졌습니다', 'error');
//     };
//
//     const handleCanvasState = (elements) => {
//       console.log('Received initial canvas state');
//       if (excalidrawAPI && elements) {
//         setLastReceivedElements(elements);
//         excalidrawAPI.updateScene({ elements });
//       }
//     };
//
//     const handleElementsUpdated = (data) => {
//       if (excalidrawAPI && data.elements) {
//         if (data.userId !== socket.id) {
//           setLastReceivedElements(data.elements);
//           excalidrawAPI.updateScene({ elements: data.elements });
//           showToast(`${data.nickname || '익명'}님이 그림을 수정했습니다`, 'info');
//         }
//       }
//     };
//
//     const handleUserJoined = (data) => {
//       console.log('User joined:', data);
//       showToast(`${data.nickname}님이 입장했습니다`, 'info');
//     };
//
//     const handlePointerUpdated = ({ userId, pointer, nickname }) => {
//       setCollaborators(prev => new Map(prev.set(userId, { pointer, nickname })));
//     };
//
//     const handleUserLeft = (data) => {
//       console.log('User left:', data);
//       setCollaborators(prev => {
//         const next = new Map(prev);
//         next.delete(data.userId);
//         return next;
//       });
//       showToast(`${data.nickname}님이 퇴장했습니다`, 'warning');
//     };
//
//     // 이벤트 리스너 등록
//     socket.on('connect', handleConnect);
//     socket.on('disconnect', handleDisconnect);
//     socket.on('canvasState', handleCanvasState);
//     socket.on('elementsUpdated', handleElementsUpdated);
//     socket.on('userJoined', handleUserJoined);
//     socket.on('pointerUpdated', handlePointerUpdated);
//     socket.on('userLeft', handleUserLeft);
//
//     // 컴포넌트 언마운트 시 이벤트 리스너 제거
//     return () => {
//       socket.off('connect', handleConnect);
//       socket.off('disconnect', handleDisconnect);
//       socket.off('canvasState', handleCanvasState);
//       socket.off('elementsUpdated', handleElementsUpdated);
//       socket.off('userJoined', handleUserJoined);
//       socket.off('pointerUpdated', handlePointerUpdated);
//       socket.off('userLeft', handleUserLeft);
//     };
//   }, [roomId, excalidrawAPI, nickname]);
//
//   const onChange = useCallback((elements) => {
//     if (!socketRef.current || !roomId || !isConnected) return;
//
//     if (JSON.stringify(elements) !== JSON.stringify(lastReceivedElements)) {
//       console.log('Sending elements update');
//       socketRef.current.emit('updateElements', { roomId, elements, nickname });
//       setLastReceivedElements(elements);
//     }
//   }, [roomId, isConnected, lastReceivedElements, nickname]);
//
//   const onPointerUpdate = useCallback(({ x, y }) => {
//     if (!socketRef.current || !roomId || !isConnected) return;
//
//     socketRef.current.emit('pointerUpdate', {
//       roomId,
//       pointer: { x, y },
//       nickname
//     });
//   }, [roomId, isConnected, nickname]);
//
//   return (
//       <div className="relative">
//         <div className="border border-purple-100 rounded-lg" style={{ height: '60vh' }}>
//           <Excalidraw
//               excalidrawAPI={(api) => setExcalidrawAPI(api)}
//               onChange={onChange}
//               onPointerUpdate={onPointerUpdate}
//               collaborators={Array.from(collaborators.entries()).map(([id, data]) => ({
//                 id,
//                 pointer: data.pointer,
//                 username: data.nickname || `User ${id.slice(0, 4)}`,
//                 color: { background: '#ffcce5', stroke: '#ff99cc' }
//               }))}
//           />
//           {toast && (
//               <Toast
//                   message={toast.message}
//                   type={toast.type}
//                   onClose={() => setToast(null)}
//               />
//           )}
//         </div>
//
//         <ChatWindow
//             key={roomId}
//             roomId={roomId}
//             socket={socketRef.current}
//             nickname={nickname}
//         />
//       </div>
//   );
// };
//
// export default CollaborativeExcalidraw;
