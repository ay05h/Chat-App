import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedImg) {
        await updateProfile({ fullName: name, bio });
        navigate("/");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image, fullName: name, bio });
        navigate("/");
        return;
      };
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl backdrop-blur-xl bg-white/10 text-white border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Edit Profile
            </h2>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm font-medium border border-white/20 hover:border-blue-400/50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between max-lg:flex-col">
          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 p-8 flex-1 w-full max-w-md"
          >
            {/* Profile Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-blue-200">
                Profile Picture
              </label>
              <label
                htmlFor="avatar"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-200 border border-white/10 hover:border-blue-400/50"
              >
                <input
                  onChange={(e) => {
                    setSelectedImg(e.target.files[0]);
                  }}
                  type="file"
                  id="avatar"
                  accept=".png, .jpg, .jpeg"
                  className="hidden"
                />
                <div className="relative">
                  <img
                    src={
                      selectedImg
                        ? URL.createObjectURL(selectedImg)
                        : `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&bold=true`
                    }
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-400/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium">Upload New Photo</p>
                  <p className="text-sm text-gray-400">JPG, PNG up to 3 MB</p>
                </div>
              </label>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-200">
                Full Name
              </label>
              <input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full p-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>

            {/* Bio Textarea */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-200">
                Bio
              </label>
              <textarea
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                value={bio}
                placeholder="Tell us about yourself..."
                required
                className="w-full p-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 resize-none"
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="flex-1 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>

          {/* Profile Preview Section */}
          <div className="flex-1 flex items-center justify-center p-8 max-lg:border-t max-lg:border-white/10 lg:border-l lg:border-white/10">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={
                    selectedImg
                      ? URL.createObjectURL(selectedImg)
                      : authUser?.profilePic ||
                        `https://ui-avatars.com/api/?name=${authUser?.fullName}&background=6366f1&color=fff&bold=true`
                  }
                  alt="profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-400/30 shadow-xl"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {name || "Your Name"}
                </h3>
                <p className="text-gray-300 max-w-xs mx-auto">
                  {bio || "Your bio will appear here..."}
                </p>
              </div>
              <div className="inline-flex px-3 py-1 bg-blue-500/20 rounded-full text-sm text-blue-200 border border-blue-400/30">
                Live Preview
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
