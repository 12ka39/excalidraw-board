import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BoardList from './components/BoardList';
import ExcalidrawEditor from './components/ExcalidrawEditor';
import PostView from "./components/PostView.jsx";

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/write" element={<ExcalidrawEditor />} />
          <Route path="/post/:id" element={<PostView />} />
        </Routes>
      </Router>
  );
};

export default App;
