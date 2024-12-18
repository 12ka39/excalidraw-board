import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BoardList from './components/BoardList';
import ExcalidrawEditor from './components/ExcalidrawEditor';
import PostView from "./components/PostView.jsx";
import EditPost from "./components/EditPost.jsx";

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/write" element={<ExcalidrawEditor />} />
          <Route path="/write/:roomId" element={<ExcalidrawEditor />} />
          <Route path="/post/:id" element={<PostView />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Routes>
      </Router>
  );
};

export default App;
