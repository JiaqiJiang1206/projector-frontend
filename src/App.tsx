import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Selector from './components/Selector';
import './App.css';
import MainApp from './components/MainApp';

function App() {
  return (
    <Router>
      {/* <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav> */}
      <Routes>
        <Route path="/" element={<Selector />} />
        <Route path="/app" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
