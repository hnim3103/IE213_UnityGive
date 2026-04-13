import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CampaignDetails from './pages/CampaignDetails';
import FAQPage from './pages/FAQPage';
import AboutUs from './pages/AboutUs';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <>
      <Toaster position='top-right' richColors />
      <BrowserRouter>
        <Routes>
          {/* Auth pages — have their own AuthLayout, no PublicLayout wrapper */}
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Public pages — wrapped in PublicLayout (Navbar + Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Route>

          {/* Admin pages — wrapped in AdminLayout (sidebar, no public Navbar) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="campaigns/create" element={<CreateCampaign />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
