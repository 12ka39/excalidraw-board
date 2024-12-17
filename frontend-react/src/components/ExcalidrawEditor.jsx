import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';

const ExcalidrawEditor = () => {
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

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
          <div className="mb-4">
            <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors"
            >
              목록으로
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
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
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


// import React, { useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Excalidraw } from '@excalidraw/excalidraw';
//
// const ExcalidrawEditor = () => {
//   const navigate = useNavigate();
//   const excalidrawRef = useRef(null);
//   const [title, setTitle] = useState('');
//   const [author, setAuthor] = useState('');
//
//   const handleSave = async () => {
//     if (!excalidrawRef.current) return;
//     if (!title.trim()) {
//       alert('제목을 입력해주세요.');
//       return;
//     }
//     if (!author.trim()) {
//       alert('글쓴이를 입력해주세요.');
//       return;
//     }
//
//     try {
//       const elements = excalidrawRef.current.getSceneElements();
//       const appState = excalidrawRef.current.getAppState();
//
//       const response = await fetch('/api/posts', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title,
//           author,
//           content: {
//             elements,
//             appState
//           }
//         }),
//       });
//
//       if (response.ok) {
//         alert('저장되었습니다!');
//         navigate('/');
//       } else {
//         const errorData = await response.json();
//         alert(errorData.error || '저장 중 오류가 발생했습니다.');
//       }
//     } catch (error) {
//       console.error('저장 중 오류 발생:', error);
//       alert('저장 중 오류가 발생했습니다.');
//     }
//   };
//
//   return (
//       <div className="p-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="mb-4">
//             <button
//                 onClick={() => navigate('/')}
//                 className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors"
//             >
//               목록으로
//             </button>
//           </div>
//
//           <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-4">
//             <div className="space-y-4">
//               <div className="flex items-center">
//                 <label htmlFor="title" className="w-24 text-gray-700">제목:</label>
//                 <input
//                     id="title"
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     placeholder="제목을 입력하세요"
//                 />
//               </div>
//               <div className="flex items-center">
//                 <label htmlFor="author" className="w-24 text-gray-700">글쓴이:</label>
//                 <input
//                     id="author"
//                     type="text"
//                     value={author}
//                     onChange={(e) => setAuthor(e.target.value)}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     placeholder="글쓴이를 입력하세요"
//                 />
//               </div>
//             </div>
//           </div>
//
//           <div className="bg-white rounded-lg shadow-sm border border-purple-100" style={{ height: '60vh' }}>
//             <Excalidraw
//                 ref={excalidrawRef}
//                 onChange={(elements, state) => {
//                   console.log("변경된 요소들:", elements);
//                   console.log("앱 상태:", state);
//                 }}
//             />
//           </div>
//
//           <button
//               onClick={handleSave}
//               className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm fixed bottom-4 right-4"
//           >
//             저장
//           </button>
//         </div>
//       </div>
//   );
// };
//
// export default ExcalidrawEditor;



// import React, { useRef, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Excalidraw } from '@excalidraw/excalidraw';
//
// const ExcalidrawEditor = () => {
//   const navigate = useNavigate();
//   const excalidrawRef = useRef(null);
//   const [title, setTitle] = useState('');
//   const [author, setAuthor] = useState('');
//
//   const handleSave = async () => {
//     if (!excalidrawRef.current) return;
//     if (!title.trim()) {
//       alert('제목을 입력해주세요.');
//       return;
//     }
//     if (!author.trim()) {
//       alert('글쓴이를 입력해주세요.');
//       return;
//     }
//
//     try {
//       const elements = excalidrawRef.current.getSceneElements();
//       const appState = excalidrawRef.current.getAppState();
//
//       const response = await fetch('/api/posts', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title,
//           author,
//           elements,
//           appState,
//         }),
//       });
//
//       if (response.ok) {
//         alert('저장되었습니다!');
//         navigate('/');
//       }
//     } catch (error) {
//       console.error('저장 중 오류 발생:', error);
//     }
//   };
//
//   return (
//       <div className="p-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="mb-4">
//             <button
//                 onClick={() => navigate('/')}
//                 className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors"
//             >
//               목록으로
//             </button>
//           </div>
//
//           <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-4">
//             <div className="space-y-4">
//               <div className="flex items-center">
//                 <label htmlFor="title" className="w-24 text-gray-700">제목:</label>
//                 <input
//                     id="title"
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     placeholder="제목을 입력하세요"
//                 />
//               </div>
//               <div className="flex items-center">
//                 <label htmlFor="author" className="w-24 text-gray-700">글쓴이:</label>
//                 <input
//                     id="author"
//                     type="text"
//                     value={author}
//                     onChange={(e) => setAuthor(e.target.value)}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     placeholder="글쓴이를 입력하세요"
//                 />
//               </div>
//             </div>
//           </div>
//
//           <div className="bg-white rounded-lg shadow-sm border border-purple-100" style={{ height: '60vh' }}>
//             <Excalidraw
//                 ref={excalidrawRef}
//                 onChange={(elements, state) => {
//                   console.log("변경된 요소들:", elements);
//                   console.log("앱 상태:", state);
//                 }}
//             />
//           </div>
//
//           <button
//               onClick={handleSave}
//               className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm fixed bottom-4 right-4"
//           >
//             저장
//           </button>
//         </div>
//       </div>
//   );
// };
//
// export default ExcalidrawEditor;
