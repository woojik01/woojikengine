import React from "react";

/**
 * WoojikEngine 에디터의 주요 앱 컴포넌트
 * 모든 UI 컴포넌트를 포함하는 루트 컴포넌트
 */
const EditorApp: React.FC = () => {
  return (
    <div className="editor-container">
      <header className="toolbar">
        <button>프로젝트</button>
        <button>저장</button>
        <button>실행</button>
        <button>중지</button>
        <button>빌드</button>
        <button>GitHub</button>
        <button>설정</button>
      </header>
      
      <div className="scene-controls">
        <button>장면 추가</button>
        <button>장면 삭제</button>
        <button>장면 복사</button>
        <button>이름 변경</button>
      </div>
      
      <div className="main-content">
        <div className="left-panel">
          <div className="scene-preview">Scene Preview</div>
          <div className="object-list">Object List</div>
        </div>
        <div className="right-panel">
          <div className="code-editor">Code Editor (Monaco)</div>
        </div>
      </div>
    </div>
  );
};

export default EditorApp;
