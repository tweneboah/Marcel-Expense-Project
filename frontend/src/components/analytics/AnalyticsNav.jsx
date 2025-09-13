import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiPieChart,
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
  FiRepeat,
  FiGrid,
  FiList,
} from "react-icons/fi";

const AnalyticsNav = ({ activeTab }) => {
  const tabs = [
    {
      id: "time-summary",
      label: "Time Summary",
      path: "/admin/analytics/time-summary",
      icon: <FiCalendar className="mr-2" />,
    },
    {
      id: "period-detail",
      label: "Period Detail",
      path: "/admin/analytics/period/month/8/2023",
      icon: <FiList className="mr-2" />,
    },
    {
      id: "category-breakdown",
      label: "Category Breakdown",
      path: "/admin/analytics/category-breakdown",
      icon: <FiPieChart className="mr-2" />,
    },
    {
      id: "expense-trends",
      label: "Expense Trends",
      path: "/admin/analytics/expense-trends",
      icon: <FiTrendingUp className="mr-2" />,
    },
    {
      id: "yearly-comparison",
      label: "Yearly Comparison",
      path: "/admin/analytics/yearly-comparison",
      icon: <FiRepeat className="mr-2" />,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const activeIndicatorVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "100%",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.nav
      className="mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ul className="flex flex-wrap border-b border-[#7678ed]/20 overflow-x-auto md:overflow-visible no-scrollbar">
        <motion.li className="mr-2" variants={itemVariants}>
          <Link
            to="/admin/analytics"
            className={`inline-flex items-center py-3 px-4 relative text-sm md:text-base font-medium rounded-t-lg transition-colors duration-200 ${
              !activeTab
                ? "bg-gradient-to-br from-[#3d348b] to-[#7678ed] text-white shadow-md"
                : "text-[#3d348b] hover:bg-[#7678ed]/10"
            }`}
          >
            <FiGrid className="mr-2" />
            Overview
            {!activeTab && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-[#f7b801] rounded-full"
                variants={activeIndicatorVariants}
              />
            )}
          </Link>
        </motion.li>
        {tabs.map((tab) => (
          <motion.li key={tab.id} className="mr-2" variants={itemVariants}>
            <Link
              to={tab.path}
              className={`inline-flex items-center py-3 px-4 relative text-sm md:text-base font-medium rounded-t-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-br from-[#3d348b] to-[#7678ed] text-white shadow-md"
                  : "text-[#3d348b] hover:bg-[#7678ed]/10"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-[#f7b801] rounded-full"
                  variants={activeIndicatorVariants}
                />
              )}
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default AnalyticsNav;
