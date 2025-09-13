import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiDollarSign,
  FiPlusCircle,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiBook,
} from "react-icons/fi";

const SalesRepLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
    {
      path: "/expenses",
      label: "My Expenses",
      icon: <FiDollarSign size={18} />,
    },
    {
      path: "/expenses/create",
      label: "Add Expense",
      icon: <FiPlusCircle size={18} />,
    },
    { path: "/profile", label: "Profile", icon: <FiUser size={18} /> },
    {
      path: "/documentation",
      label: "Documentation",
      icon: <FiBook size={18} />,
    },
  ];

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: isMobile ? "-100%" : 0,
      opacity: isMobile ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const menuItemVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "rgba(247, 184, 1, 0.15)",
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-20"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className="fixed md:relative z-30 h-full w-72 overflow-y-auto shadow-xl"
      >
        <div className="h-full flex flex-col bg-gradient-to-br from-[#3d348b] to-[#7678ed]">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 bg-[#3d348b]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#f7b801] flex items-center justify-center">
                <FiDollarSign className="text-[#3d348b] text-xl" />
              </div>
              <span className="text-white font-bold text-xl">
                Expense Manager
              </span>
            </motion.div>
            {isMobile && (
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#f7b801",
                  color: "#3d348b",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="p-2 rounded-md text-white hover:bg-[#f7b801] hover:text-[#3d348b] transition-colors duration-200"
              >
                <FiX size={20} />
              </motion.button>
            )}
          </div>

          {/* User Info in Sidebar */}
          <div className="px-6 py-4 border-b border-[#7678ed]/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#f7b801] to-[#f35b04] flex items-center justify-center text-white shadow-md text-lg font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
              </div>
              <div>
                <div className="font-medium text-white">
                  {user?.name || "Sales Rep"}
                </div>
                <div className="text-xs text-white/70">
                  {user?.email || "sales@example.com"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 py-6 overflow-y-auto">
            <div className="px-3">
              <div className="text-xs uppercase tracking-wider text-white/50 font-semibold pl-4 mb-2">
                Main Menu
              </div>
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      whileHover={menuItemVariants.hover}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          location.pathname === item.path ||
                          location.pathname.startsWith(item.path + "/")
                            ? "bg-[#f35b04] bg-opacity-30 text-white"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        <span
                          className={`mr-3 ${
                            location.pathname === item.path ||
                            location.pathname.startsWith(item.path + "/")
                              ? "text-[#f7b801]"
                              : "text-[#f7b801]"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-[#7678ed]/30">
            <motion.button
              whileHover={{
                scale: 1.03,
                background: "linear-gradient(to right, #f35b04, #f7b801)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-[#f35b04] text-white transition-all duration-200"
            >
              <FiLogOut className="mr-2" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#f7b801",
                  color: "#3d348b",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-[#3d348b] text-white md:hidden focus:outline-none transition-colors duration-200"
              >
                <FiMenu size={18} />
              </motion.button>

              {/* Page Title */}
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-[#3d348b] hidden md:block"
              >
                {menuItems.find(
                  (item) =>
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/")
                )?.label || "Dashboard"}
              </motion.h1>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <FiSettings size={18} />
                </motion.button>
                <Link
                  to="/profile"
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-[#3d348b] to-[#7678ed] flex items-center justify-center text-white md:hidden"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SalesRepLayout;
