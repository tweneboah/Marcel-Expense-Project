import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import { FiCheck, FiLock, FiArrowLeft, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // Validate the token format minimally
  useEffect(() => {
    if (!resettoken || resettoken.length < 20) {
      setError("Invalid reset token. Please request a new reset link.");
    }
  }, [resettoken]);

  const validatePassword = () => {
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await resetPassword(resettoken, password);
      setIsSuccess(true);
      toast.success("Password reset successful");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to reset password";
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
        {isSuccess ? (
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="flex justify-center" variants={itemVariants}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#3d348b] to-[#7678ed] flex items-center justify-center">
                <FiCheck className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h3
              className="mt-6 text-2xl font-bold text-[#3d348b]"
              variants={itemVariants}
            >
              Password Reset Successful
            </motion.h3>

            <motion.p className="mt-4 text-gray-600" variants={itemVariants}>
              Your password has been reset successfully. You will be redirected
              to the login page shortly.
            </motion.p>

            <motion.div className="mt-8" variants={itemVariants}>
              <Link
                to="/login"
                className="relative group w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium rounded-lg text-white overflow-hidden transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#f7b801] to-[#f35b04] group-hover:from-[#f35b04] group-hover:to-[#f7b801] transition-all duration-300"></span>
                <span className="relative flex items-center">
                  <FiArrowLeft className="mr-2" />
                  Go to login
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
                Reset Password
              </h2>
              <p className="mt-2 text-gray-600">
                Enter your new password below to complete the reset process.
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
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7678ed]">
                    <FiLock />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-10 py-3 border border-[#7678ed]/30 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
                    placeholder="At least 6 characters"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7678ed]">
                    <FiShield />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-10 py-3 border border-[#7678ed]/30 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
                    placeholder="Confirm your new password"
                  />
                </div>
              </motion.div>

              {validationError && (
                <motion.div
                  className="p-4 text-sm text-[#f35b04] bg-[#f35b04]/10 rounded-lg border border-[#f35b04]/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {validationError}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading || error}
                  className="group relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#3d348b] to-[#7678ed] border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7678ed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiCheck className="w-5 h-5 text-[#f7b801] group-hover:text-white transition-colors duration-200" />
                  </span>
                  {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
