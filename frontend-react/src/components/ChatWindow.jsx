import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';

const ChatWindow = ({ roomId, socket, nickname }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (message) => {
      setMessages(prev => [...prev, message]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket, isOpen]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      text: newMessage,
      sender: nickname,
      timestamp: new Date().toISOString()
    };

    socket.emit('chatMessage', { roomId, message });
    setNewMessage('');
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-controls')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      setPosition({
        x: Math.min(Math.max(0, newX), window.innerWidth - 350),
        y: Math.min(Math.max(0, newY), window.innerHeight - 500)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleChatButtonClick = () => {
    console.log('채팅 버튼 클릭됨 - 현재 상태:', isOpen);
    setIsOpen(true);
    setUnreadCount(0);
    console.log('채팅창 상태 변경 후:', true);
  };

  // 사용자별 색상을 관리하는 함수
  const getUserColor = (senderId) => {
    // 미리 정의된 색상 배열
    const colors = [
      { bg: '#FFE4E1', text: '#8B0000' }, // 연한 분홍색
      { bg: '#E0FFFF', text: '#008B8B' }, // 연한 청록색
      { bg: '#F0FFF0', text: '#006400' }, // 연한 초록색
      { bg: '#FFF0F5', text: '#8B008B' }, // 연한 자주색
      { bg: '#F5F5DC', text: '#8B4513' }  // 연한 베이지색
    ];

    // senderId를 기반으로 색상 선택 (간단한 해시 함수)
    const index = senderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!isOpen) {
    return (
        <button
            onClick={handleChatButtonClick}
            className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center z-40"
        >
          <MessageCircle className="w-6 h-6"/>
          {unreadCount > 0 && (
              <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
          )}
        </button>
    );
  }

  return (
      <div
          ref={chatWindowRef}
          style={{
            position: 'fixed',
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: '350px',
            zIndex: 9999,
            backgroundColor: '#f3e8ff',
            height: isMinimized ? '48px' : '500px'
          }}
          className="rounded-lg shadow-xl transition-all"
      >
        <div
            onMouseDown={handleMouseDown}
            style={{ backgroundColor: '#f3e8ff' }}
            className="h-12 rounded-t-lg flex items-center justify-between px-4 cursor-move"
        >
          <span className="text-purple-900 font-medium">채팅</span>
          <div className="chat-controls flex items-center space-x-2">
            <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-purple-700 hover:text-purple-900 transition-colors"
            >
              {isMinimized ? <Maximize2 size={18}/> : <Minimize2 size={18}/>}
            </button>
            <button
                onClick={() => setIsOpen(false)}
                className="text-purple-700 hover:text-purple-900 transition-colors"
            >
              <X size={18}/>
            </button>
          </div>
        </div>
        {!isMinimized && (
            <>
            <div
                className="h-[400px] p-4 overflow-y-auto"
                style={{ backgroundColor: '#f3e8ff' }}
            >
              {messages.map((msg, idx) => {
                const isMyMessage = msg.sender === nickname;
                const messageColor = isMyMessage ? null : getUserColor(msg.sender);

                return (
                    <div
                        key={idx}
                        className={`mb-4 ${
                            isMyMessage ? 'text-right' : 'text-left'
                        }`}
                    >
                      <div className="mb-1 text-xs text-gray-900">
                        {msg.sender}
                      </div>
                      <div
                          className={`inline-block max-w-[70%] rounded-lg px-4 py-2`}
                          style={
                            isMyMessage
                                ? { backgroundColor: '#9333ea', color: 'white' }
                                : {
                                  backgroundColor: messageColor.bg,
                                  color: messageColor.text
                                }
                          }
                      >
                        <div>{msg.text}</div>
                      </div>
                    </div>
                );
              })}
              <div ref={messageEndRef}/>
            </div>

              <form
                  onSubmit={handleSend}
                  className="h-[88px] p-4"
                  style={{ backgroundColor: '#f3e8ff' }}
              >
                <div className="flex space-x-2">
                  <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-4 py-2 bg-white text-purple-900 rounded-lg placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    전송
                  </button>
                </div>
              </form>
            </>
        )}
      </div>
  );
};

export default ChatWindow;
