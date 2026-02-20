import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Database from './pages/Database';
import Insights from './pages/Insights';
import Repertoire from './pages/Repertoire';
import Analysis from './pages/Analysis';

import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-deep)',
      }}>
        <TopNav />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/database" element={<Database />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/repertoire" element={<Repertoire />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;
