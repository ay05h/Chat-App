import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Send } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    setError("");
    setLoading(true);
    try {
      const credentials = {
        email: data.loginEmail,
        password: data.loginPassword,
      };
      await login(credentials);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-start gap-8 sm:justify-evenly max-sm:flex-col max-sm:gap-1 backdrop-blur-2xl">
      {/* logo */}

      <div className=" min-w-[240px] flex flex-col items-center justify-center space-y-4 py-10">
        <div className="w-30 h-30 pr-2 pt-2 md:pr-5 md:pt-5 md:w-55 md:h-55 bg-gradient-to-br from-violet-700/30 to-blue-700/30 backdrop-blur-xl flex justify-center items-center rounded-full shadow-lg animate-pulse">
          <Send className="w-20 h-20 md:w-45 md:h-45 text-white/60" />
        </div>
        <div className="text-xl md:text-2xl font-semibold text-gray-400">
          <Typewriter
            words={["Welcome to Chatterly"]}
            loop={0}
            cursor
            cursorStyle="_"
            typeSpeed={100}
            deleteSpeed={75}
            delaySpeed={2000}
            cursorColor="#8245ec"
          />
        </div>
      </div>

      {/* login */}
      <div className=" border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-4 justify-center items-center rounded-2xl w-full max-w-xs lg:max-w-sm ">
        <h1 className="text-center text-2xl sm:text-3xl font-bold leading-tight text-white">
          Login
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4 w-full">
          {/* Email */}
          <div className="w-full max-w-md">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter you email"
              {...register("loginEmail", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Email address must be a valid address",
                },
              })}
            />
            {errors.loginEmail && (
              <p className="mt-2 text-sm text-red-400">
                {errors.loginEmail.message}
              </p>
            )}
          </div>

          {/* password */}
          <div className="w-full max-w-sm">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              {...register("loginPassword", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.loginPassword && (
              <p className="mt-2 text-sm text-red-400">
                {errors.loginPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md transition-opacity duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-500">
          Don&apos;t have any account?&nbsp;&nbsp;
          <Link
            to="/signup"
            className="font-medium text-violet-500 hover:text-violet-900 cursor-pointer"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
