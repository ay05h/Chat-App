import React, { useContext, useState } from "react";
import assets from "./../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";

const SignupPage = () => {
  const [details, setDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [error, setError] = useState("");
  const { signup } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm();
  const navigate = useNavigate();
  const handleSignUp = async (data) => {
    setError("");
    setLoading(true);
    try {
      const credentials = {
        profilePic: selectedImg,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        bio: data.bio,
      };

      if (!selectedImg) {
        const proceed = await signup(credentials);
        if (proceed) {
          navigate("/login");
        }
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);

      reader.onload = async () => {
        try {
          const base64Image = reader.result;

          const proceed = await signup({
            ...credentials,
            profilePic: base64Image,
          });

          if (proceed) {
            navigate("/login");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      // ❌ Remove this — otherwise signup is called before FileReader finishes
      // await signup(credentials);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen bg-cover  bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col-reverse backdrop-blur-2xl">
      {/* SignUp */}
      <div className=" border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-4 justify-center items-center rounded-2xl w-full max-w-xs lg:max-w-sm ">
        <h1 className="text-center text-2xl sm:text-3xl font-bold leading-tight text-white">
          SignUp
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
        <form
          onSubmit={handleSubmit(handleSignUp)}
          className="space-y-4 w-full"
        >
          {/* Fullname */}

          {!details && (
            <div className="w-full max-w-md">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          )}
          {/* Email */}
          {!details && (
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
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Email address must be a valid address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {/* password */}
          {!details && (
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
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}
          {!details && (
            <button
              type="button"
              onClick={async () => {
                const isValid = await trigger([
                  "fullName",
                  "email",
                  "password",
                ]);
                if (isValid) {
                  setDetails(true);
                }
              }}
              className={`w-full py-3 bg-gradient-to-r from-purple-400 to-violet-600 
                text-white rounded-md transition-opacity duration-200 cursor-pointer 
                hover:from-purple-600 hover:to-violet-800`}
            >
              Sign Up
            </button>
          )}

          {/* profile Image */}

          {details && (
            <label
              htmlFor="avatar"
              className=" flex items-center gap-3 cursor-pointer"
            >
              <input
                onChange={(e) => {
                  setSelectedImg(e.target.files[0]);
                }}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
              />
              <img
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : assets.avatar_icon
                }
                alt="avatar"
                className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
              />
              Upload Profile Image
            </label>
          )}
          {/* bio */}
          {details && (
            <div>
              <textarea
                id="bio"
                placeholder="Write profile bio"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
                {...register("bio", {
                  required: "Bio is required",
                })}
              ></textarea>
              {errors.bio && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.bio.message}
                </p>
              )}
            </div>
          )}

          {/* save */}
          {details && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md transition-opacity duration-200  hover:from-purple-600 hover:to-violet-800 ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Save
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-500">
          already have an account?&nbsp;&nbsp;
          <Link
            to="/login"
            className="font-medium text-violet-500 hover:text-violet-900 cursor-pointer"
          >
            Log In
          </Link>
        </p>
      </div>

      {/* logo */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />
    </div>
  );
};

export default SignupPage;
