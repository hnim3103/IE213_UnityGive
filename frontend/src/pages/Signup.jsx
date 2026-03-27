import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';

const Signup = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Invalid email address.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!formData.agreedToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsSigningUp(true);

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }
        throw new Error(data.message || "Failed to create account");
      }

      toast.success("Account created successfully! Please login.");
      navigate("/login");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred during signup.");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <AuthLayout
      title={<>Join the UnityGive<br />Community</>}
      subtitle={<>We make a living by what we get <br /> but we make a life by what we give.</>}
      dividerText="or register with email"
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      <form className="flex flex-col gap-6" onSubmit={handleEmailSignup}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="hello@nature.org"
              className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4 whitespace-nowrap overflow-hidden text-ellipsis">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80 px-4 whitespace-nowrap overflow-hidden text-ellipsis">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4">
          <div className="pt-1">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleInputChange}
              className="w-4 h-4 rounded-full border-sage-200 text-sage-800 focus:ring-sage-800 hover:cursor-pointer"
            />
          </div>
          <p className="text-[12px] text-earth-900 font-plus-jakarta mt-0.5">
            I agree to the <Link to="/terms" className="text-sage-800 font-medium hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-sage-800 font-medium hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSigningUp}
          className="w-full py-7 bg-sage-800 hover:bg-sage-900 text-white rounded-full text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 font-plus-jakarta"
        >
          {isSigningUp ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
