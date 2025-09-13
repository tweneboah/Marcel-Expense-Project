import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiPieChart,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiSearch,
  FiBarChart2,
  FiGrid,
  FiActivity,
  FiBarChart,
  FiPlusCircle,
  FiClipboard,
  FiArrowRight,
} from "react-icons/fi";

const Reports = () => {
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

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
      },
    },
  };

  // Report cards data
  const reportCards = [
    {
      title: "Year-to-Date Reports",
      description:
        "View comprehensive year-to-date expense reports with previous year comparison",
      icon: <FiCalendar size={24} />,
      path: "/reports/ytd",
      color: "#3d348b",
      bgColor: "rgba(61, 52, 139, 0.1)",
    },
    {
      title: "Chart Data",
      description:
        "Visualize expenses data with customizable charts (pie, bar, line)",
      icon: <FiPieChart size={24} />,
      path: "/reports/chart-data",
      color: "#7678ed",
      bgColor: "rgba(118, 120, 237, 0.1)",
    },
    {
      title: "Expense Forecasting",
      description:
        "Predict future expenses based on historical data with different forecasting methods",
      icon: <FiTrendingUp size={24} />,
      path: "/reports/forecast",
      color: "#f7b801",
      bgColor: "rgba(247, 184, 1, 0.1)",
    },
    {
      title: "Budget Comparison",
      description:
        "Compare budgeted vs. actual expenses by category for any period",
      icon: <FiBarChart2 size={24} />,
      path: "/reports/budget-comparison",
      color: "#f35b04",
      bgColor: "rgba(243, 91, 4, 0.1)",
    },
    {
      title: "Advanced Filtered Expenses",
      description:
        "Search and filter expenses with multiple customizable criteria",
      icon: <FiSearch size={24} />,
      path: "/reports/advanced-expenses",
      color: "#3d348b",
      bgColor: "rgba(61, 52, 139, 0.1)",
    },
    {
      title: "General Analytics",
      description:
        "Access comprehensive analytics dashboard for overview and insights",
      icon: <FiActivity size={24} />,
      path: "/analytics",
      color: "#7678ed",
      bgColor: "rgba(118, 120, 237, 0.1)",
    },
  ];

  // Budget management cards data
  const budgetCards = [
    {
      title: "Budgets List",
      description:
        "View, create, edit and delete budgets for different categories and periods",
      icon: <FiClipboard size={24} />,
      path: "/budgets",
      color: "#f7b801",
      bgColor: "rgba(247, 184, 1, 0.1)",
    },
    {
      title: "Budget Summary",
      description:
        "See yearly budget summary with monthly and category breakdowns",
      icon: <FiBarChart size={24} />,
      path: "/budgets/summary",
      color: "#f35b04",
      bgColor: "rgba(243, 91, 4, 0.1)",
    },
    {
      title: "Create New Budget",
      description: "Set up new budgets for categories and time periods",
      icon: <FiPlusCircle size={24} />,
      path: "/budgets/create",
      color: "#3d348b",
      bgColor: "rgba(61, 52, 139, 0.1)",
    },
  ];

  // Custom card component
  const ReportCard = ({ card }) => (
    <motion.div
      className="mb-6"
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <Link to={card.path} className="block h-full no-underline">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100">
          <div className="px-6 py-6">
            <div className="flex items-start mb-4">
              <div
                className="rounded-lg p-3 mr-4 flex-shrink-0"
                style={{ backgroundColor: card.bgColor }}
              >
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: card.color }}
                >
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <span
                className="text-sm font-medium flex items-center group"
                style={{ color: card.color }}
              >
                View
                <FiArrowRight className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FiFileText className="text-[#f7b801] mr-3 text-2xl" />
        <h1 className="text-3xl font-bold text-[#3d348b]">
          Reports & Analytics
        </h1>
      </motion.div>

      <motion.p
        className="text-gray-600 mb-8 max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Access detailed reports and analytics to gain insights into your
        expenses and make data-driven decisions.
      </motion.p>

      <motion.div className="mb-12" variants={sectionVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((card, index) => (
            <ReportCard key={card.path} card={card} />
          ))}
        </div>
      </motion.div>

      <motion.div className="mb-6 flex items-center" variants={sectionVariants}>
        <FiDollarSign className="text-[#f35b04] mr-3 text-2xl" />
        <h2 className="text-2xl font-bold text-[#3d348b]">Budget Management</h2>
      </motion.div>

      <motion.div className="mb-8" variants={sectionVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetCards.map((card, index) => (
            <ReportCard key={card.path} card={card} />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-12 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-xl p-8 text-white shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f7b801] opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f35b04] opacity-10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2 flex items-center">
              <FiGrid className="mr-2" />
              Need a custom dashboard?
            </h3>
            <p className="text-blue-100 max-w-lg">
              Our team can help you build custom dashboards tailored to your
              specific business needs
            </p>
          </div>
          <Link
            to="/admin/contact"
            className="inline-flex items-center px-6 py-3 bg-white text-[#3d348b] rounded-lg font-medium hover:shadow-md transition-all duration-300 group"
          >
            Contact Support
            <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Reports;
