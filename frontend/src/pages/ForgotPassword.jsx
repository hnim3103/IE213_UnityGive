import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      toast.success(data.message || "Recovery email sent. Check your inbox!");
      // Optionally reset the field
      setEmail('');

    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={<>Forgot Your<br />Password?</>}
      subtitle="Enter your email to receive a recovery link."
      dividerText="recovery instructions"
      footerText="Remembered it?"
      footerLinkText="Back to Login"
      footerLinkTo="/login"
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@nature.org"
              className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-7 bg-sage-800 hover:bg-sage-900 text-white rounded-full text-lg shadow-lg shadow-sage-800/20 transition-all active:scale-[0.98] disabled:opacity-70 font-plus-jakarta"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
