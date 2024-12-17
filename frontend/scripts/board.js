// scripts/board.js
document.addEventListener('DOMContentLoaded', () => {
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

  const boardList = document.getElementById('boardList');

  posts.forEach(post => {
    const row = document.createElement('tr');
    row.className = 'border-b border-purple-50 hover:bg-purple-50 transition-colors';
    row.innerHTML = `
            <td class="py-4 px-6 text-center">${post.id}</td>
            <td class="py-4 px-6">
                <a href="#" class="hover:text-purple-700 transition-colors">
                    ${post.title}
                </a>
            </td>
            <td class="py-4 px-6 hover:text-purple-600">${post.author}</td>
            <td class="py-4 px-6 text-center">${post.views}</td>
            <td class="py-4 px-6 text-center">${post.date}</td>
        `;
    boardList.appendChild(row);
  });
});

// scripts/editor.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('excalidraw-container');
  const excalidrawAPI = new Excalidraw.init({
    container: container,
    onChange: (elements, state) => {
      console.log("변경된 요소들:", elements);
      console.log("앱 상태:", state);
    }
  });

  // 저장 버튼 추가
  const saveButton = document.createElement('button');
  saveButton.className = 'px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm fixed bottom-4 right-4';
  saveButton.textContent = '저장';
  saveButton.onclick = async () => {
    try {
      const elements = await excalidrawAPI.getSceneElements();
      const appState = await excalidrawAPI.getAppState();

      const response = await fetch('/api/drawings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          elements: elements,
          appState: appState
        })
      });

      if (response.ok) {
        alert('저장되었습니다!');
        window.location.href = '/';
      }
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
    }
  };
  document.body.appendChild(saveButton);
});
