import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Reset link sent to your email");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to send reset email";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-[#7678ed]/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isSubmitted ? (
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="flex justify-center" variants={itemVariants}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#3d348b] to-[#7678ed] flex items-center justify-center">
                <FiCheckCircle className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h3
              className="mt-6 text-2xl font-bold text-[#3d348b]"
              variants={itemVariants}
            >
              Check your email
            </motion.h3>

            <motion.p className="mt-4 text-gray-600" variants={itemVariants}>
              We've sent a password reset link to{" "}
              <span className="font-semibold text-[#f35b04]">{email}</span>.
              Please check your inbox.
            </motion.p>

            <motion.div className="mt-8" variants={itemVariants}>
              <Link
                to="/login"
                className="relative group w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium rounded-lg text-white overflow-hidden transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#f7b801] to-[#f35b04] group-hover:from-[#f35b04] group-hover:to-[#f7b801] transition-all duration-300"></span>
                <span className="relative flex items-center">
                  <FiArrowLeft className="mr-2" />
                  Return to login
                </span>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="text-center"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="mt-2 text-3xl font-bold bg-gradient-to-r from-[#3d348b] to-[#7678ed] bg-clip-text text-transparent">
                Forgot Password?
              </h2>
              <p className="mt-2 text-gray-600">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </motion.div>

            {error && (
              <motion.div
                className="p-4 mb-4 text-sm text-[#f35b04] bg-[#f35b04]/10 rounded-lg border border-[#f35b04]/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <motion.form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7678ed]">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="block w-full px-10 py-3 border border-[#7678ed]/30 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#3d348b] to-[#7678ed] border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7678ed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiMail className="w-5 h-5 text-[#f7b801] group-hover:text-white transition-colors duration-200" />
                  </span>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </motion.div>

              <motion.div className="text-center pt-4" variants={itemVariants}>
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-[#3d348b] hover:text-[#f35b04] transition-colors duration-200"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to login
                </Link>
              </motion.div>
            </motion.form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
