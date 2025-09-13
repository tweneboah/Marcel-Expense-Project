import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaChartArea,
  FaCalendarAlt,
  FaUserCog,
  FaTags,
  FaCog,
  FaFileAlt,
  FaAngleDown,
  FaAngleUp,
  FaTable,
  FaSearch,
  FaWallet,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBook,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    analytics: location.pathname.includes("/admin/analytics"),
    reports: location.pathname.includes("/admin/reports"),
    budgets: location.pathname.includes("/admin/budgets"),
  });
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

  const toggleSubmenu = (menu) => {
    setExpandedMenus((prev) => {
      // If the menu is already open, close it
      if (prev[menu]) {
        return {
          ...prev,
          [menu]: false,
        };
      }
      
      // Close all other menus and open the selected one
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === menu;
      });
      
      return newState;
    });
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <FaChartBar size={18} />,
    },
    {
      path: "/admin/expenses",
      label: "Expenses",
      icon: <FaFileAlt size={18} />,
    },
    {
      path: "/admin/users",
      label: "User Management",
      icon: <FaUserCog size={18} />,
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: <FaTags size={18} />,
    },

    {
      label: "Budgets",
      icon: <FaWallet size={18} />,
      submenu: true,
      subItems: [
        {
          path: "/admin/budgets",
          label: "Budget Overview",
          icon: <FaChartPie size={14} />,
        },
        {
          path: "/admin/budgets/create",
          label: "Create Budget",
          icon: <FaMoneyBillWave size={14} />,
        },
        {
          path: "/admin/reports/all-budgets",
          label: "All Budgets",
          icon: <FaFileAlt size={14} />,
        },
      ],
    },
    {
      label: "Analytics",
      icon: <FaChartPie size={18} />,
      submenu: true,
      subItems: [
        {
          path: "/admin/analytics",
          label: "Dashboard",
          icon: <FaChartLine size={14} />,
        },

        {
          path: "/admin/analytics/time-summary",
          label: "Time Summary",
          icon: <FaCalendarAlt size={14} />,
        },
        {
          path: "/admin/analytics/period/month/8/2023",
          label: "Period Detail",
          icon: <FaFileAlt size={14} />,
        },
        {
          path: "/admin/analytics/category-breakdown",
          label: "Category Breakdown",
          icon: <FaChartPie size={14} />,
        },
        {
          path: "/admin/analytics/expense-trends",
          label: "Expense Trends",
          icon: <FaChartLine size={14} />,
        },
        {
          path: "/admin/analytics/yearly-comparison",
          label: "Yearly Comparison",
          icon: <FaChartArea size={14} />,
        },
      ],
    },
    {
      label: "Reports",
      icon: <FaFileAlt size={18} />,
      submenu: true,
      subItems: [
        {
          path: "/admin/reports",
          label: "Overview",
          icon: <FaTable size={14} />,
        },
        {
          path: "/admin/reports/ytd",
          label: "YTD Reports",
          icon: <FaTable size={14} />,
        },
        {
          path: "/admin/reports/budget-comparison",
          label: "Budget Comparison",
          icon: <FaTable size={14} />,
        },
        {
          path: "/admin/reports/chart-data",
          label: "Chart Data",
          icon: <FaChartArea size={14} />,
        },

        {
          path: "/admin/reports/forecast",
          label: "Expense Forecasting",
          icon: <FaChartLine size={14} />,
        },

        {
          path: "/admin/reports/filtered-expenses",
          label: "Advanced Filtered Expenses",
          icon: <FaSearch size={14} />,
        },
        {
          path: "/admin/reports/budget-summary",
          label: "Budget Summary",
          icon: <FaTable size={14} />,
        },
      ],
    },
    {
      path: "/admin/profile",
      label: "Profile",
      icon: <FaUserCircle size={18} />,
    },
    {
      path: "/admin/documentation",
      label: "Documentation",
      icon: <FaBook size={18} />,
    },
    {
      path: "/admin/settings",
      label: "System Settings",
      icon: <FaCog size={18} />,
    },
  ];

  const isActiveMenu = (item) => {
    if (item.submenu) {
      return item.subItems.some(
        (subItem) => location.pathname === subItem.path
      );
    }
    return location.pathname === item.path;
  };

  const isActiveSubItem = (path) => {
    return location.pathname === path;
  };

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? "18rem" : "18rem",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: isMobile ? "-100%" : 0,
      width: isMobile ? "18rem" : "4rem",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const menuItemVariants = {
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(247, 184, 1, 0.15)",
      transition: {
        duration: 0.2,
      },
    },
  };

  const subMenuVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2,
        duration: 0.3,
        ease: "easeOut",
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const subItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    closed: {
      y: -10,
      opacity: 0,
      transition: {
        duration: 0.3,
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
        className={`fixed md:relative z-30 h-full overflow-y-auto shadow-xl ${!isOpen && !isMobile ? 'overflow-hidden' : ''}`}
      >
        <div className="h-full flex flex-col bg-gradient-to-br from-[#3d348b] to-[#7678ed]">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-[#3d348b]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#f7b801] flex items-center justify-center">
                <FaUser className="text-[#3d348b]" />
              </div>
              {(isOpen || isMobile) && (
                <span className="text-white font-bold text-lg whitespace-nowrap">Admin Panel</span>
              )}
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
                className="p-1 rounded-md text-white hover:bg-[#f7b801] hover:text-[#3d348b] transition-colors duration-200"
              >
                <FaTimes size={20} />
              </motion.button>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#7678ed] scrollbar-track-transparent">
            <ul className="px-3 space-y-2">
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.label || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  {item.submenu ? (
                    <div className="space-y-1">
                      <motion.button
                        whileHover={menuItemVariants.hover}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !isOpen && !isMobile ? null : toggleSubmenu(item.label.toLowerCase())}
                        title={!isOpen && !isMobile ? item.label : ''}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActiveMenu(item) ||
                          expandedMenus[item.label.toLowerCase()]
                            ? "bg-[#f35b04] bg-opacity-30 text-white"
                            : "text-white hover:bg-[#f7b801] hover:bg-opacity-15"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`text-[#f7b801] ${!isOpen && !isMobile ? 'mx-auto' : 'mr-3'}`}>
                            {item.icon}
                          </span>
                          {(isOpen || isMobile) && (
                            <span className="font-medium whitespace-nowrap">{item.label}</span>
                          )}
                        </div>
                        {(isOpen || isMobile) && (
                          <motion.span
                            animate={{
                              rotate: expandedMenus[item.label.toLowerCase()]
                                ? 180
                                : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaAngleDown size={16} className="text-[#f7b801]" />
                          </motion.span>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {expandedMenus[item.label.toLowerCase()] && (isOpen || isMobile) && (
                          <motion.div
                            variants={subMenuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="overflow-hidden"
                          >
                            <ul className="ml-6 space-y-1 pl-3 border-l-2 border-[#f7b801] border-opacity-50">
                              {item.subItems.map((subItem, idx) => (
                                <motion.li
                                  key={subItem.path}
                                  variants={subItemVariants}
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Link
                                    to={subItem.path}
                                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                      isActiveSubItem(subItem.path)
                                        ? "bg-[#f35b04] bg-opacity-80 text-white font-medium"
                                        : "text-white text-opacity-80 hover:bg-[#f7b801] hover:bg-opacity-15"
                                    }`}
                                  >
                                    <span className="mr-2 text-[#f7b801]">
                                      {subItem.icon}
                                    </span>
                                    <span>{subItem.label}</span>
                                  </Link>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      whileHover={menuItemVariants.hover}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        title={!isOpen && !isMobile ? item.label : ''}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          location.pathname === item.path
                            ? "bg-[#f35b04] bg-opacity-30 text-white"
                            : "text-white hover:bg-[#f7b801] hover:bg-opacity-15"
                        }`}
                      >
                        <span className={`text-[#f7b801] ${!isOpen && !isMobile ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                        {(isOpen || isMobile) && (
                          <span className="font-medium whitespace-nowrap">{item.label}</span>
                        )}
                      </Link>
                    </motion.div>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-[#7678ed] bg-[#3d348b] bg-opacity-40">
            <motion.button
              whileHover={{
                scale: 1.03,
                background: "linear-gradient(to right, #f35b04, #f7b801)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-[#f35b04] text-white transition-all duration-200"
            >
              <FaSignOutAlt className={!isOpen && !isMobile ? 'mx-auto' : 'mr-2'} />
              {(isOpen || isMobile) && (
                <span>Logout</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isOpen ? 'md:ml-0' : 'md:ml-16'}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Sidebar Toggle Button */}
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#f7b801",
                  color: "#3d348b",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-[#3d348b] text-white focus:outline-none transition-colors duration-200"
                title={isOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </motion.button>

              {/* Page Title */}
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-[#3d348b] flex-1 text-center md:text-left md:flex-none"
              >
                {menuItems.find(
                  (item) =>
                    item.path === location.pathname ||
                    (item.submenu &&
                      item.subItems.some(
                        (subItem) => subItem.path === location.pathname
                      ))
                )?.label ||
                  menuItems
                    .find(
                      (item) =>
                        item.submenu &&
                        item.subItems.some(
                          (subItem) => subItem.path === location.pathname
                        )
                    )
                    ?.subItems.find(
                      (subItem) => subItem.path === location.pathname
                    )?.label ||
                  "Dashboard"}
              </motion.h1>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#3d348b]">
                    {user?.name || "Admin User"}
                  </p>
                  <Link
                    to="/admin/profile"
                    className="text-xs text-gray-500 hover:text-[#f35b04] transition-colors duration-200"
                  >
                    View Profile
                  </Link>
                </div>
                <Link
                  to="/admin/profile"
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-[#3d348b] to-[#7678ed] flex items-center justify-center text-white hover:shadow-md transition-all duration-200"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
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

export default AdminLayout;
