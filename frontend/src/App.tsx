import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, SplitLayout } from './components/Layout';
import { LoadingSpinner } from './components/common';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Lazy load admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const ProjectFormPage = lazy(() => import('./pages/admin/ProjectFormPage'));

// User preference for layout type
type LayoutPreference = 'standard' | 'guide';

function App() {
  const [layoutPreference, setLayoutPreference] = useState<LayoutPreference>('standard');

  // Load user preference on app start
  useEffect(() => {
    const savedPreference = localStorage.getItem('layoutPreference');
    if (savedPreference === 'guide' || savedPreference === 'standard') {
      setLayoutPreference(savedPreference);
    }
  }, []);

  // Wrapper component for pages other than HomePage
  const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return layoutPreference === 'guide' ? (
      <SplitLayout>{children}</SplitLayout>
    ) : (
      <Layout>{children}</Layout>
    );
  };

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

          <Route path="/projects" element={
            <PageWrapper>
              <ProjectsPage />
            </PageWrapper>
          } />

          <Route path="/projects/:id" element={
            <PageWrapper>
              <ProjectDetailPage />
            </PageWrapper>
          } />

          <Route path="/about" element={
            <PageWrapper>
              <AboutPage />
            </PageWrapper>
          } />

          <Route path="/contact" element={
            <PageWrapper>
              <ContactPage />
            </PageWrapper>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/projects/new" element={<ProjectFormPage />} />
          <Route path="/admin/projects/edit/:id" element={<ProjectFormPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
