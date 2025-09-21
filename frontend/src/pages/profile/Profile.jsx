import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiBriefcase,
  FiCalendar,
} from "react-icons/fi";
import UpdateProfile from "./UpdateProfile";
import ChangePassword from "./ChangePassword";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // profile or password

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

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
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would be an API call in a real app
      // Updating profile data

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNotification({
        type: "success",
        message: "Profile updated successfully!",
      });

      setTimeout(() => {
        setNotification({ type: "", message: "" });
      }, 3000);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (user?.newPassword !== user?.confirmPassword) {
      setNotification({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    setLoading(true);

    try {
      // This would be an API call in a real app
      // Changing password

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNotification({
        type: "success",
        message: "Password changed successfully!",
      });

      setTimeout(() => {
        setNotification({ type: "", message: "" });
      }, 3000);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-6xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with gradient background */}
      <motion.div
        className="mb-8 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-2xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-10">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#f7b801] opacity-10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10 flex items-center">
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-xl flex items-center justify-center text-white mr-6 shadow-lg backdrop-blur-sm">
              <FiSettings className="text-[#f7b801] text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Profile Settings
              </h1>
              <p className="text-white text-opacity-80">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {notification.message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === "success"
              ? "bg-[#f7b801]/10 text-[#f7b801] border border-[#f7b801]/20"
              : "bg-[#f35b04]/10 text-[#f35b04] border border-[#f35b04]/20"
          }`}
        >
          {notification.type === "success" ? (
            <FiCheckCircle className="mr-3 text-[#f7b801]" />
          ) : (
            <FiXCircle className="mr-3 text-[#f35b04]" />
          )}
          {notification.message}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("profile")}
            className={`${
              activeTab === "profile"
                ? "border-[#f7b801] text-[#3d348b]"
                : "border-transparent text-gray-500 hover:text-[#7678ed] hover:border-[#7678ed]/30"
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center mr-8 transition-all duration-200`}
          >
            <FiUser
              className={`mr-2 ${
                activeTab === "profile" ? "text-[#f7b801]" : ""
              }`}
            />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`${
              activeTab === "password"
                ? "border-[#f7b801] text-[#3d348b]"
                : "border-transparent text-gray-500 hover:text-[#7678ed] hover:border-[#7678ed]/30"
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
          >
            <FiLock
              className={`mr-2 ${
                activeTab === "password" ? "text-[#f7b801]" : ""
              }`}
            />
            Change Password
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <motion.div
          className="bg-white shadow-lg rounded-xl overflow-hidden h-fit border border-gray-100"
          variants={itemVariants}
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] px-6 py-4 text-white">
            <h3 className="font-semibold">User Profile</h3>
          </div>

          {/* Profile image */}
          <div className="flex justify-center -mt-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#f7b801] to-[#f35b04] rounded-full flex items-center justify-center text-white text-4xl border-4 border-white shadow-md transform transition-transform hover:scale-105">
              {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
            </div>
          </div>

          <div className="p-6">
            {/* Account details */}
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-[#7678ed]/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#3d348b]/10 flex items-center justify-center text-[#3d348b] mr-4">
                  <FiUser />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="font-medium">{user?.name || "Not set"}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-[#7678ed]/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#3d348b]/10 flex items-center justify-center text-[#3d348b] mr-4">
                  <FiMail />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium">{user?.email || "Not set"}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-[#7678ed]/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#3d348b]/10 flex items-center justify-center text-[#3d348b] mr-4">
                  <FiShield />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Role</div>
                  <div className="font-medium capitalize">
                    {user?.role || "User"}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional user info - for visual enhancement */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-4">
                Account Information
              </h4>

              <div className="flex items-center mb-3 text-sm">
                <FiBriefcase className="text-[#f7b801] mr-2" />
                <span className="text-gray-600">AussenDienst GmbH</span>
              </div>

              <div className="flex items-center text-sm">
                <FiCalendar className="text-[#f7b801] mr-2" />
                <span className="text-gray-600">
                  Member since {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div className="md:col-span-2" variants={itemVariants}>
          {activeTab === "profile" ? <UpdateProfile /> : <ChangePassword />}

          {/* Footer card with tips - replacing danger zone */}
          <motion.div
            className="mt-8 bg-gradient-to-r from-[#f7b801]/10 to-[#f35b04]/10 rounded-xl p-6 border border-[#f7b801]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-[#3d348b] mb-3 flex items-center">
              <FiEdit className="mr-2 text-[#f35b04]" />
              Profile Tips
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-[#f7b801] mr-2">•</span>
                Keep your profile information up to date to ensure accurate
                reporting
              </li>
              <li className="flex items-start">
                <span className="text-[#f7b801] mr-2">•</span>
                Change your password regularly for better security
              </li>
              <li className="flex items-start">
                <span className="text-[#f7b801] mr-2">•</span>
                Make sure your email address is correct to receive important
                notifications
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
