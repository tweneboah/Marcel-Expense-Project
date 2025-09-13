import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  FaRegCalendarAlt,
  FaLightbulb,
  FaFileExport,
  FaChartBar,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import ReportsNav from "../reports/ReportsNav";

const ReportsLayout = () => {
  const location = useLocation();
  const isMainReportsPage = location.pathname === "/admin/reports";
  const [showTip, setShowTip] = useState(false);

  const tips = [
    "Filter reports by date range for more specific insights",
    "Export data regularly to keep backups of your expense records",
    "Use the dashboard charts to spot spending trends at a glance",
    "Compare monthly expenses to identify seasonal patterns",
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FaRegCalendarAlt className="mr-2" />
            Budget Reports Dashboard
            </h1>
            <p className="text-gray-200 mt-1">
              View, analyze, and export your expense data
            </p>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {isMainReportsPage && <ReportsNav />}

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Outlet />
        </motion.div>

        <motion.div
          className="mt-6 p-4 bg-white rounded-lg shadow-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-start">
            <FaLightbulb className="text-[#f7b801] mt-1 mr-3 text-xl flex-shrink-0" />
            <div>
              <h3 className="font-medium text-[#3d348b] mb-2">Pro Tip</h3>
              <p className="text-gray-700">{randomTip}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              className="p-3 bg-gray-50 rounded-md hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center text-[#3d348b] mb-2">
                <FaFileExport className="mr-2" />
                <h4 className="font-medium">Export Options</h4>
              </div>
              <p className="text-sm text-gray-600">
                Export your reports in CSV or Excel formats for easy
                sharing.
              </p>
            </motion.div>

            <motion.div
              className="p-3 bg-gray-50 rounded-md hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center text-[#3d348b] mb-2">
                <FaChartBar className="mr-2" />
                <h4 className="font-medium">Visualize Data</h4>
              </div>
              <p className="text-sm text-gray-600">
                Switch between different chart types to better understand your
                expense patterns.
              </p>
            </motion.div>

            <motion.div
              className="p-3 bg-gray-50 rounded-md hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center text-[#3d348b] mb-2">
                <FaCalendarAlt className="mr-2" />
                <h4 className="font-medium">Time Periods</h4>
              </div>
              <p className="text-sm text-gray-600">
                View reports by week, month, quarter, or custom date ranges for
                targeted analysis.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsLayout;
