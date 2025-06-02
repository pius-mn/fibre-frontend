import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProjectDetails from './pages/ProjectDetails'; // New page for project details
import ProtectedRoute from './components/ProtectedRoute';
import ProjectsList from './components/editor/ProjectsList';
import ProjectFormPage from './components/editor/ProjectFormPage';
import LoginPage from './pages/LoginPage';
import Unauthorized from './pages/Unauthorized';
import ProjectProgress from './pages/Reports';
import Dashboard from './components/editor/Dashboard';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />



        <Route path="/" element={<Dashboard />}>
          <Route index element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProtectedRoute allowedRoles={['user', 'admin', 'editor']} />}>
            <Route index element={<ProjectDetails />} />
          </Route>
          <Route path="create" element={<ProtectedRoute allowedRoles={['editor']} />}>
            <Route index element={<ProjectFormPage />} />
          </Route>
          <Route path="edit/:projectId" element={<ProtectedRoute allowedRoles={['editor','admin']} />}>
            <Route index element={<ProjectFormPage />} />
          </Route>
          <Route path="report" element={<ProtectedRoute allowedRoles={['editor','admin']} />}>
            <Route index element={<ProjectProgress />} />
          </Route>
          <Route path="unauthorized">
            <Route index element={<Unauthorized />} />
            </Route>

        </Route>
        
        {/* User Route
        <Route path="/user" element={<ProtectedRoute allowedRoles={['User']} />}>
          <Route index element={<UserDashboard />} />
        </Route>*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;


