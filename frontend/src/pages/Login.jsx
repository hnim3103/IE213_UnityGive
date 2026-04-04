import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';

const Login = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setIsLoggingIn(true);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Welcome back to Unity Give!");
      navigate("/");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout
      title={<>Welcome Back to<br />UnityGive</>}
      subtitle="Nurturing Change Together"
      dividerText="or login with email"
      footerText="New to the greenhouse?"
      footerLinkText="Create an Account"
      footerLinkTo="/signup"
    >
      <form className="flex flex-col gap-6" onSubmit={handleEmailLogin}>
        <div className="flex flex-col gap-5">
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
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-4">
              <label className="text-[12px] uppercase tracking-[1.2px] text-earth-900/80">Password</label>
              <Link to="/forgot-password" title="Chưa có tính năng này" className="text-[12px] text-earth-500 hover:underline">Forgot Password?</Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-7 py-4 bg-sage-50/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/30"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-7 bg-[#ffc38f] hover:bg-[#ffb36f] text-[#794e25] rounded-full text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 font-plus-jakarta"
        >
          {isLoggingIn ? "Logging In..." : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
