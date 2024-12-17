document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('excalidraw-container');

  // React 컴포넌트로 Excalidraw 초기화
  const App = () => {
    return React.createElement(ExcalidrawLib.Excalidraw, {
      onChange: (elements, state) => {
        console.log("변경된 요소들:", elements);
        console.log("앱 상태:", state);
      }
    });
  };

  // React 컴포넌트 렌더링
  ReactDOM.render(React.createElement(App), container);
});

// 저장 기능 구현
async function saveDrawing() {
  const excalidrawAPI = document.querySelector('.excalidraw').excalidrawAPI;
  if (!excalidrawAPI) return;

  const elements = await excalidrawAPI.getSceneElements();
  const appState = await excalidrawAPI.getAppState();

  try {
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
      console.log("그림이 저장되었습니다!");
    }
  } catch (error) {
    console.error("저장 중 오류 발생:", error);
  }
}
