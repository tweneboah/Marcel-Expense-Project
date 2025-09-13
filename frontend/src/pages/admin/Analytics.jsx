import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnalyticsNav from "../../components/analytics/AnalyticsNav";
import {
  FiCalendar,
  FiPieChart,
  FiTrendingUp,
  FiRepeat,
  FiFileText,
  FiArrowRight,
  FiActivity,
  FiBarChart,
  FiCheckCircle,
  FiGrid,
} from "react-icons/fi";

const Analytics = () => {
  const analyticsModules = [
    {
      title: "Time Period Summary",
      description: "View expense summaries by month, quarter, and year",
      path: "/admin/analytics/time-summary",
      icon: <FiCalendar size={24} />,
      color: "#3d348b",
      secondaryColor: "#7678ed",
      illustration: (
        <div className="relative w-20 h-20">
          <div className="absolute right-0 bottom-0 w-16 h-16 rounded-lg bg-[#3d348b]/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-[#3d348b]/20"></div>
          </div>
          <div className="absolute left-0 top-0 w-14 h-14 rounded-lg bg-[#7678ed]/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-[#7678ed]/30 flex items-center justify-center">
              <FiCalendar className="text-[#3d348b]" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Period Detail",
      description:
        "View detailed expenses and metrics for a specific time period",
      path: "/admin/analytics/period/month/8/2023",
      icon: <FiFileText size={24} />,
      color: "#22A39F",
      secondaryColor: "#3d348b",
      illustration: (
        <div className="relative w-20 h-20">
          <div className="absolute right-0 bottom-0 w-16 h-16 rounded-lg bg-[#22A39F]/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-[#22A39F]/20"></div>
          </div>
          <div className="absolute left-0 top-0 w-14 h-14 rounded-lg bg-[#3d348b]/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-[#3d348b]/30 flex items-center justify-center">
              <FiFileText className="text-[#22A39F]" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Category Breakdown",
      description: "Analyze expenses by category with detailed charts",
      path: "/admin/analytics/category-breakdown",
      icon: <FiPieChart size={24} />,
      color: "#7678ed",
      secondaryColor: "#3d348b",
      illustration: (
        <div className="relative w-20 h-20">
          <div className="absolute right-0 top-0 w-14 h-14 rounded-full border-4 border-[#7678ed]/30"></div>
          <div className="absolute left-2 bottom-0 w-14 h-14 rounded-full bg-[#7678ed]/10 flex items-center justify-center">
            <FiPieChart className="text-[#7678ed] w-6 h-6" />
          </div>
        </div>
      ),
    },
    {
      title: "Expense Trends",
      description: "Track expense trends over time with moving averages",
      path: "/admin/analytics/expense-trends",
      icon: <FiTrendingUp size={24} />,
      color: "#f7b801",
      secondaryColor: "#f35b04",
      illustration: (
        <div className="relative w-20 h-20">
          <div className="absolute left-0 top-0 w-full h-full">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                d="M10 50 L30 30 L50 45 L70 20"
                stroke="#f7b801"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 60 L30 40 L50 55 L70 30"
                stroke="#f35b04"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 4"
              />
            </svg>
          </div>
        </div>
      ),
    },
    {
      title: "Yearly Comparison",
      description: "Compare expenses year-over-year to spot patterns",
      path: "/admin/analytics/yearly-comparison",
      icon: <FiRepeat size={24} />,
      color: "#f35b04",
      secondaryColor: "#f7b801",
      illustration: (
        <div className="relative w-20 h-20">
          <div className="absolute left-0 bottom-0 w-10 h-16 rounded-md bg-[#f35b04]/10 flex items-center justify-center">
            <div className="w-6 h-10 rounded bg-[#f35b04]/20 flex-grow"></div>
          </div>
          <div className="absolute right-0 bottom-0 w-10 h-12 rounded-md bg-[#f7b801]/20 flex items-center justify-center">
            <div className="w-6 h-8 rounded bg-[#f7b801]/30 flex-grow"></div>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
            <FiRepeat className="text-[#f35b04] w-7 h-7" />
          </div>
        </div>
      ),
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.6,
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const quickStatsItems = [
    {
      label: "Total Expenses",
      value: "534",
      icon: <FiActivity />,
      color: "#3d348b",
    },
    {
      label: "Distance Traveled",
      value: "8,293 km",
      icon: <FiBarChart />,
      color: "#7678ed",
    },
    {
      label: "Expenses Paid",
      value: "498",
      icon: <FiCheckCircle />,
      color: "#f7b801",
    },
    {
      label: "Total Cost",
      value: "CHF 45,320",
      icon: <FiFileText />,
      color: "#f35b04",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <motion.h1
              className="text-3xl font-bold text-[#3d348b] mb-2 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <FiGrid className="mr-3 text-[#f7b801]" />
              Analytics Dashboard
            </motion.h1>
            <motion.p
              className="text-gray-600 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Get insights into your company's expenses across different time
              periods, categories, and trends.
            </motion.p>
          </div>
        </div>

        <AnalyticsNav activeTab={null} />
      </motion.div>

      {/* Quick Stats Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        variants={statsVariants}
        initial="hidden"
        animate="visible"
      >
        {quickStatsItems.map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200"
            style={{ borderColor: stat.color }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <span className="text-2xl" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {analyticsModules.map((module, index) => (
          <motion.div
            key={module.path}
            variants={itemVariants}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group"
          >
            <Link to={module.path} className="block h-full">
              <div className="bg-white rounded-xl overflow-hidden h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="px-6 pt-8 pb-6">
                  <div className="flex flex-col md:flex-row gap-6 md:items-center mb-6">
                    <div className="order-2 md:order-1">
                      <h3 className="text-xl font-bold mb-2 text-[#3d348b] group-hover:text-[#7678ed] transition-colors duration-200">
                        {module.title}
                      </h3>
                      <p className="text-gray-600">{module.description}</p>
                    </div>
                    <div className="md:ml-auto order-1 md:order-2 flex-shrink-0">
                      {module.illustration}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div className="w-full h-1 rounded-full overflow-hidden bg-gray-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(to right, ${module.color}, ${module.secondaryColor})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <span
                      className="inline-flex items-center text-sm font-semibold tracking-wide group-hover:tracking-wider transition-all"
                      style={{ color: module.color }}
                    >
                      VIEW ANALYSIS
                      <FiArrowRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>


    </div>
  );
};

export default Analytics;
