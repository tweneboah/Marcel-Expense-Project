import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiLogIn, FiUser, FiArrowRight } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    setFormError("");

    // Validate form
    if (!email || !password) {
      setFormError("Please enter both email and password");
      return;
    }

    try {
      const data = await login({ email, password });

      // Redirect based on user role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/expenses");
      }
    } catch (err) {
      // Use the error message from the server
      setFormError(
        err.message ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    }
  };

  // Use either the form error or the authentication error
  const displayError = formError || authError;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#7678ed]/20 via-white to-[#f7b801]/20">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        {/* Left panel - decorative with brand colors */}
        <motion.div
          className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#3d348b] to-[#7678ed] p-12 text-white"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center w-32 h-32 rounded-full bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20">
              <FiUser className="w-20 h-20 text-white" />
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold mb-4 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Willkommen zurück
          </motion.h2>
          <motion.p
            className="text-xl text-center text-white/80 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Log in to manage your expenses with AussenDienst GmbH
          </motion.p>
          <motion.div
            className="w-full max-w-xs"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-white/90 italic mb-4">
                "Tracking expenses has never been easier. This app has
                revolutionized how we manage our field team's costs."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#f7b801] flex items-center justify-center text-[#3d348b] font-bold text-lg mr-3">
                  AB
                </div>
                <div>
                  <h4 className="font-semibold">Anna Becker</h4>
                  <p className="text-sm text-white/70">Sales Director</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right panel - login form */}
        <motion.div
          className="bg-white p-8 sm:p-12 flex flex-col justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3d348b] to-[#7678ed] bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to access your expense account
            </p>
          </motion.div>

          {displayError && (
            <motion.div
              className="p-4 mb-6 text-sm text-[#f35b04] bg-[#f35b04]/10 rounded-lg border border-[#f35b04]/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {displayError}
            </motion.div>
          )}

          <motion.form
            className="space-y-5"
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7678ed]">
                  <FiMail />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="block w-full px-10 py-3 border border-[#7678ed]/30 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7678ed]">
                  <FiLock />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="block w-full px-10 py-3 border border-[#7678ed]/30 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
                />
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#3d348b] hover:text-[#f35b04] transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                className="group relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#3d348b] to-[#7678ed] border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7678ed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                disabled={loading}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLogIn className="w-5 h-5 text-[#f7b801] group-hover:text-white transition-colors duration-200" />
                </span>
                {loading ? "Logging in..." : "Sign In"}
              </button>
            </motion.div>
          </motion.form>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="inline-flex items-center font-medium text-[#3d348b] hover:text-[#f35b04] transition-colors duration-200"
              >
                Register Now
                <FiArrowRight className="ml-1 text-[#f7b801]" />
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
