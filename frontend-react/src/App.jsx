import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BoardList from './components/BoardList';
import ExcalidrawEditor from './components/ExcalidrawEditor';

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/write" element={<ExcalidrawEditor />} />
        </Routes>
      </Router>
  );
};

export default App;
