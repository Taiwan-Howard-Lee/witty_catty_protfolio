import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, ProjectsPage, ProjectDetailPage, AboutPage, ContactPage } from './pages';
import { AdminLoginPage, AdminDashboardPage, ProjectFormPage } from './pages/admin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/projects/new" element={<ProjectFormPage />} />
        <Route path="/admin/projects/edit/:id" element={<ProjectFormPage />} />
      </Routes>
    </Router>
  );
}

export default App;
