import React from 'react';
import { useNavigate } from 'react-router-dom';

const BoardList = () => {
  const navigate = useNavigate();
  const posts = [
    { id: 8, title: '테스트 글입니다', author: '윤고객님', views: 6, date: '11-12' },
    { id: 7, title: '테스트 글입니다', author: '윤고객님', views: 8, date: '11-12' },
    { id: 6, title: '테스트 글입니다', author: '윤고객님', views: 5, date: '11-12' },
    { id: 5, title: '테스트 글입니다', author: '윤고객님', views: 7, date: '11-12' },
    { id: 4, title: '테스트 글입니다', author: '윤고객님', views: 6, date: '11-12' },
    { id: 3, title: '테스트 글입니다', author: '윤고객님', views: 5, date: '11-12' },
    { id: 2, title: '테스트 글입니다', author: '윤고객님', views: 8, date: '11-12' },
    { id: 1, title: '테스트 글입니다', author: '윤고객님', views: 8, date: '11-12' }
  ];

  return (
      <div className="bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-purple-800">자유게시판</h1>

          {/* 게시판 테이블 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <table className="min-w-full">
              <thead>
              <tr className="bg-purple-50 text-purple-900 text-sm">
                <th className="py-3 px-6 text-left w-16">번호</th>
                <th className="py-3 px-6 text-left">제목</th>
                <th className="py-3 px-6 text-left w-24">글쓴이</th>
                <th className="py-3 px-6 text-center w-20">조회</th>
                <th className="py-3 px-6 text-center w-24">날짜</th>
              </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
              {posts.map(post => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-6 text-center">{post.id}</td>
                    <td className="py-4 px-6">
                      <button onClick={() => {/* 게시글 상세보기 로직 */}}
                              className="hover:text-purple-700 transition-colors text-left w-full">
                        {post.title}
                      </button>
                    </td>
                    <td className="py-4 px-6">{post.author}</td>
                    <td className="py-4 px-6 text-center">{post.views}</td>
                    <td className="py-4 px-6 text-center">{post.date}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end mb-6">
            <button
                onClick={() => navigate('/write')}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
            >
              글쓰기
            </button>
          </div>
        </div>
      </div>
  );
};

export default BoardList;
