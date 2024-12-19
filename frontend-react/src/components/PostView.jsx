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

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('게시글 삭제에 실패했습니다.');
        }

        alert('게시글이 삭제되었습니다.');
        navigate('/');  // 목록 페이지로 이동
      } catch (error) {
        console.error('삭제 중 오류 발생:', error);
        alert(error.message);
      }
    }
  };

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
                className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              목록으로
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
              <div className="flex justify-between text-sm text-gray-500">
                <span>작성자: {post.author}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
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

            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
              <button
                  onClick={() => navigate(`/edit/${id}`)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors shadow-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                수정
              </button>
              <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PostView;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Excalidraw } from '@excalidraw/excalidraw';
//
// const PostView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [post, setPost] = useState(null);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         const response = await fetch(`/api/posts/${id}`);
//         if (!response.ok) {
//           throw new Error('게시글을 불러오는데 실패했습니다.');
//         }
//         const data = await response.json();
//         setPost(data);
//       } catch (error) {
//         setError(error.message);
//       }
//     };
//
//     fetchPost();
//   }, [id]);
//
//   if (error) {
//     return (
//         <div className="p-4 text-red-600">
//           {error}
//         </div>
//     );
//   }
//
//   if (!post) {
//     return (
//         <div className="p-4">
//           로딩 중...
//         </div>
//     );
//   }
//
//   return (
//       <div className="p-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="mb-4">
//             <button
//                 onClick={() => navigate('/')}
//                 className="px-4 py-2 text-purple-700 hover:bg-purple-50 rounded transition-colors flex items-center gap-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
//               </svg>
//               목록으로
//             </button>
//           </div>
//
//           <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-4">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
//               <div className="flex justify-between text-sm text-gray-500">
//                 <span>작성자: {post.author}</span>
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center">
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
//                     </svg>
//                     <span>{post.views}</span>
//                   </div>
//                   <div className="flex items-center">
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
//                     </svg>
//                     <span>{post.date}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//
//           <div className="relative">
//             <div className="bg-white rounded-lg shadow-sm border border-purple-100" style={{ height: '60vh' }}>
//               <Excalidraw
//                   initialData={{
//                     elements: post.content.elements,
//                     appState: {
//                       viewModeEnabled: true,
//                       zenModeEnabled: false,
//                       gridSize: null,
//                       theme: "light"
//                     }
//                   }}
//                   viewModeEnabled
//               />
//             </div>
//
//             <div className="absolute bottom-4 right-4 flex gap-2 z-10">
//               <button
//                   onClick={() => navigate(`/edit/${id}`)}
//                   className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors shadow-sm flex items-center gap-1"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
//                 </svg>
//                 수정
//               </button>
//               <button
//                   onClick={() => {
//                     if (window.confirm('정말 삭제하시겠습니까?')) {
//                       // 삭제 로직 구현 예정
//                     }
//                   }}
//                   className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-1"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
//                 </svg>
//                 삭제
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
// };
//
// export default PostView;
