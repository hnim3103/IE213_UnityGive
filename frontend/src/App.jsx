import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CampaignDetails from "./pages/CampaignDetails";
import FAQPage from "./pages/FAQPage";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

import AdminDashboard from "./pages/AdminDashboard";
import ManagedCampaigns from "./pages/ManagedCampaigns";
import CreateCampaign from "./pages/CreateCampaign";
import EditCampaign from "./pages/EditCampaign";
import AdminUsers from "./pages/AdminUsers";
import AdminVerifications from "./pages/AdminVerifications";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";

import PublicLayout from "./layouts/PublicLayout";
// (Optional but recommended)
import AdminLayout from "./layouts/AdminLayout";
import ProfileSetting from "./pages/ProfileSetting";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <Routes>
          {/* PUBLIC LAYOUT (with Navbar + Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* USER PROTECTED */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileSetting />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* AUTH ROUTES — no Navbar / Footer */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* ADMIN ROUTES (NESTED CLEANLY) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="campaigns" element={<ManagedCampaigns />} />
            <Route path="campaigns/create" element={<CreateCampaign />} />
            <Route path="campaigns/:id/edit" element={<EditCampaign />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="verifications" element={<AdminVerifications />} />
          </Route>

          {/* GLOBAL 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
