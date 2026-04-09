import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success(data.message || "Password updated successfully!");
      navigate('/login');

    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={<>Create New<br />Password</>}
      subtitle="Ensure your new password is secure."
      dividerText="almost there"
      footerText="Remembered it?"
      footerLinkText="Back to Login"
      footerLinkTo="/login"
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-7 bg-sage-800 hover:bg-sage-900 text-white rounded-full text-lg shadow-lg shadow-sage-800/20 transition-all active:scale-[0.98] disabled:opacity-70 font-plus-jakarta"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
