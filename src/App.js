import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import DataUpload from "./DataUpload";
import DataRetrieval from "./DataRetrieval";
import Report from './Report';
import BuntingCalendar from './BuntingCalendar';
import Login from './Login';
import './App.css';
import { Home } from '@mui/icons-material';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');

// Callback function to receive loginId from child
const handleLoginId = (id) => {
  setLoginId(id);
};

  return (
    <Router>
      <div className="container">
        <nav className="sidebar">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/dataupload">Data Upload</Link>
            </li>
            <li>
              <Link to="/dataretrieval">Data Retrieval</Link>
            </li>
            <li>
              <Link to="/calendar">Bunting Calendar</Link>
            </li>
            <li>
              <Link to="/report">Report</Link>
            </li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route
              path="/login"
              element={<Login setAuth={setIsAuthenticated} setLoginId={handleLoginId} />}
            />
            <Route
              path="/"
              element={
                isAuthenticated ? <Home /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/dataupload"
              element={
                isAuthenticated ? <DataUpload loginId={loginId}/> : <Navigate to="/login" />
              }
            />
            <Route
              path="/dataretrieval"
              element={
                isAuthenticated ? <DataRetrieval /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/calendar"
              element={
                isAuthenticated ? <BuntingCalendar /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/report"
              element={
                isAuthenticated ? <Report /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
