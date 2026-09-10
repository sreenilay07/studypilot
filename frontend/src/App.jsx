import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreateStudyKit } from './pages/CreateStudyKit';
import { StudySessionDetail } from './pages/StudySessionDetail';
import { QuizPage } from './pages/QuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { MistakesPage } from './pages/MistakesPage';
import { RevisionPage } from './pages/RevisionPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Workspace Routes inside AppShell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <Home />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <AppShell>
              <CreateStudyKit />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <StudySessionDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id/quiz"
        element={
          <ProtectedRoute>
            <AppShell>
              <QuizPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id/result"
        element={
          <ProtectedRoute>
            <AppShell>
              <QuizResultPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id/mistakes"
        element={
          <ProtectedRoute>
            <AppShell>
              <MistakesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id/revision"
        element={
          <ProtectedRoute>
            <AppShell>
              <RevisionPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-roadmap"
        element={
          <ProtectedRoute>
            <AppShell>
              <Home />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppShell>
              <HistoryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProgressPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
