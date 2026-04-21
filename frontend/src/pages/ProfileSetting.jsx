import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "../lib/api";

const ProfileSetting = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    walletAddress: "",
    role: "",
    kycStatus: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    isVerifiedAccount: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/api/users/profile");
        const user = response.data;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          walletAddress: user.walletAddress || "",
          role: user.role ? user.role.toUpperCase() : "DONOR",
          kycStatus: user.kycStatus ? user.kycStatus.toUpperCase() : "NONE",
          avatar: user.avatar || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          isVerifiedAccount: user.isVerified || false,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Note: Ideally you would first upload this file to a server/S3 and get the URL back.
      // Since we just have the `avatar` string field in the PUT route, we will keep local preview.
      // You should replace this part with a real upload logic returning the URL.
      const tempUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: tempUrl });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put("/api/users/profile", {
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        walletAddress: formData.walletAddress,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "An error occurred, please try again!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen py-12 px-4 flex justify-center items-center font-sans tracking-wide">
        <p className="text-gray-500 font-medium">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-sage-800 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 text-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Avatar Header */}
          <div className="bg-[#F8F8F8] rounded-[24px] p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm">
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2C3B2E] shadow-sm">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#E5D7CA] rounded-full p-2">
                    <div className="w-full h-full bg-[#FAF5EE] rounded-full flex items-center justify-center">
                      {/* Placeholder abstract shapes if no avatar */}
                      <div className="bg-[#E5D7CA] w-16 h-16 rounded-full opacity-80"></div>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-[#2C3B2E] text-white p-2 rounded-full border-2 border-white hover:bg-[#1A251B] transition-colors"
                aria-label="Edit Avatar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left self-center">
              <p className="text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-1">
                Account Settings
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#1A251B]">
                {formData.name}
              </h1>
              <p className="text-[#2C3B2E]/70 font-medium mt-1 mb-5">
                {formData.role}
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className="bg-white border-none shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-full text-xs font-semibold transition-colors"
              >
                Upload New Avatar
              </button>
            </div>
          </div>

          {/* Card 2: Personal Information */}
          <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-gray-100">
            <h2 className="flex items-center text-xl font-serif text-[#1A251B] mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 mr-3 text-[#5A4036]"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  Fullname
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-800 text-sm focus:ring-2 focus:ring-[#2C3B2E]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-800 text-sm focus:ring-2 focus:ring-[#2C3B2E]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Enter your phone number"
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-800 text-sm focus:ring-2 focus:ring-[#2C3B2E]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  disabled
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-500 text-[13px] font-mono cursor-not-allowed outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Account Status & Verification */}
          <div className="bg-[#F8F8F8] rounded-[24px] p-6 sm:p-10 shadow-sm border border-gray-100">
            <h2 className="flex items-center text-xl font-serif text-[#1A251B] mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 mr-3 text-[#2C3B2E]"
              >
                <path
                  fillRule="evenodd"
                  d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              Account Status & Verification
            </h2>

            <div className="flex flex-wrap items-center justify-between sm:w-[80%] gap-8">
              <div className="min-w-fit">
                <span className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-3">
                  User Role
                </span>
                <span className="inline-block bg-[rgba(230,230,230,0.8)] text-[#2C3B2E] text-[11px] px-3.5 py-1 rounded-full font-bold border border-gray-300">
                  {formData.role}
                </span>
              </div>

              <div className="min-w-fit">
                <span className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-3">
                  Kyc Status
                </span>
                <span className="inline-flex items-center bg-[#E5F5E9] text-[#1B602A] text-[11px] px-3.5 py-1 rounded-full font-bold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5 mr-1.5 opacity-80"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formData.kycStatus}
                </span>
              </div>

              <div className="min-w-fit">
                <span className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-3">
                  Verification Status
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-[13px] font-medium text-gray-700">
                    Verified Account
                  </span>
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-not-allowed ${formData.isVerifiedAccount ? "bg-[#2C3B2E]" : "bg-gray-300"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow border-none transform duration-300 ease-in-out ${formData.isVerifiedAccount ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Security & Authentication */}
          <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-gray-100">
            <h2 className="flex items-center text-xl font-serif text-[#1A251B] mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 mr-3 text-[#5A4036]"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              Security & Authentication
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-7 mb-8">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  placeholder="••••••••"
                  disabled
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-500 text-[13px] font-mono cursor-not-allowed outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-800 text-sm focus:ring-2 focus:ring-[#2C3B2E]/20 outline-none placeholder-gray-400 font-mono tracking-widest text-lg h-[46px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#2C3B2E]/60 uppercase mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#f6f6f6] border-0 rounded-[12px] px-4 py-3.5 text-gray-800 text-sm focus:ring-2 focus:ring-[#2C3B2E]/20 outline-none placeholder-gray-400 font-mono tracking-widest text-lg h-[46px]"
                />
              </div>
            </div>

            <div className="bg-[#f9f9f9] rounded-xl p-4 flex items-start border border-[#f0f0f0]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 mr-3 text-gray-400 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                To keep your account secure, passwords should be at least 12
                characters long and include a mix of uppercase letters, symbols,
                and numbers.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-6 pt-6 mb-20">
            <button
              type="button"
              className="text-[13px] font-bold text-[#1A251B] hover:text-black transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#2C3B2E] text-white px-10 py-3.5 rounded-full text-sm font-medium shadow-[0_4px_12px_rgba(44,59,46,0.2)] hover:bg-[#1A251B] transition-colors focus:ring-4 focus:ring-[#2C3B2E]/20 hover:scale-[1.02] disabled:opacity-70 flex items-center"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Footer Quote */}
        <div className="text-center w-full mt-24">
          <p className="text-[#a0a0a0] italic font-serif text-[17px] leading-relaxed max-w-2xl mx-auto mb-3">
            "The greatness of a community is most accurately measured by the
            <br />
            compassionate actions of its members."
          </p>
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#b0b0b0] uppercase">
            UnityGive Foundation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
