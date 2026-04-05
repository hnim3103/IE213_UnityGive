import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import FAQPage from './pages/FAQPage';
import AboutUs from './pages/AboutUs';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <>
      <Toaster position='top-right' richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
