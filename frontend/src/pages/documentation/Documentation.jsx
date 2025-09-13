import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  FiBook,
  FiDollarSign,
  FiFileText,
  FiUser,
  FiSettings,
  FiPlusCircle,
  FiBarChart2,
  FiHelpCircle,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";

const Documentation = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [expandedSection, setExpandedSection] = useState("introduction");

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Sections that are visible to both admin and sales rep
  const commonSections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <FiBook />,
      content: (
        <div>
          <p className="mb-4">
            Welcome to the AussenDienst GmbH Expense Management System. This
            documentation provides detailed information on how to use the
            application for tracking and managing expenses efficiently.
          </p>
          <p className="mb-4">
            The application is designed to help sales representatives track
            their travel expenses and for administrators to manage and monitor
            all expenses across the organization.
          </p>
          <p>
            <strong>Key Features:</strong>
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Easy expense tracking with automatic distance calculation</li>
            <li>Comprehensive reporting and analytics</li>
            <li>User-friendly interface for quick expense submission</li>
            <li>Profile management and customization options</li>
            <li>Export capabilities for accounting and record-keeping</li>
          </ul>
        </div>
      ),
    },
    {
      id: "expenses",
      title: "Managing Expenses",
      icon: <FiDollarSign />,
      content: (
        <div>
          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Creating a New Expense
          </h4>
          <p className="mb-4">
            To create a new expense, navigate to the "Add Expense" section from
            the sidebar. Fill in the required details:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Start and destination points (addresses)</li>
            <li>Date of travel</li>
            <li>Purpose of the trip</li>
            <li>Any additional notes for reference</li>
          </ul>

          <p className="mb-4">
            The system will automatically calculate the distance and
            corresponding expense amount based on the predetermined rate per
            kilometer (currently set at{" "}
            <strong>{isAdmin ? "CHF 0.70" : "CHF 0.70"}</strong> per kilometer).
          </p>

          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Viewing Expenses
          </h4>
          <p className="mb-4">
            All your submitted expenses can be viewed in the "My Expenses"
            section. Here you can:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Filter expenses by date, status, or amount</li>
            <li>Sort entries in ascending or descending order</li>
            <li>View details of each expense by clicking on it</li>
            <li>
              Edit or delete expenses (if they haven't been processed yet)
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Profile Management",
      icon: <FiUser />,
      content: (
        <div>
          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Updating Your Profile
          </h4>
          <p className="mb-4">
            You can update your profile information by navigating to the Profile
            section from the sidebar. Here, you can:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Update your name and email</li>
            <li>Change your password</li>
            <li>View your role and access level</li>
          </ul>

          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Password Security
          </h4>
          <p className="mb-4">
            To maintain security, we recommend changing your password regularly.
            Guidelines for a strong password:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>At least 8 characters long</li>
            <li>Includes a mix of uppercase and lowercase letters</li>
            <li>Contains numbers and special characters</li>
            <li>
              Avoid using easily guessable information (birthdays, names, etc.)
            </li>
          </ul>
        </div>
      ),
    },
  ];

  // Admin-specific sections
  const adminSections = [
    {
      id: "user-management",
      title: "User Management",
      icon: <FiUser />,
      content: (
        <div>
          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Managing Users
          </h4>
          <p className="mb-4">
            As an administrator, you can manage all users in the system. This
            includes:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Adding new users (sales representatives)</li>
            <li>Editing user information</li>
            <li>Deactivating user accounts when needed</li>
            <li>Resetting user passwords</li>
          </ul>

          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            User Roles
          </h4>
          <p className="mb-4">The system has two primary roles:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>
              <strong>Admin:</strong> Full access to manage users, view all
              expenses, and configure system settings
            </li>
            <li>
              <strong>Sales Representative:</strong> Can submit, view, and
              manage their own expenses
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      icon: <FiBarChart2 />,
      content: (
        <div>
          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Dashboard Analytics
          </h4>
          <p className="mb-4">
            The admin dashboard provides comprehensive analytics, including:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Total expenses by month, quarter, and year</li>
            <li>Expense breakdown by category</li>
            <li>Top spenders (sales representatives)</li>
            <li>Trend analysis and projections</li>
          </ul>

          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Generating Reports
          </h4>
          <p className="mb-4">
            You can generate various reports in different formats:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Monthly expense summaries</li>
            <li>Quarterly financial reports</li>
            <li>Annual expense analysis</li>
            <li>User-specific expense reports</li>
          </ul>
          <p>
            Reports can be exported as PDF or CSV files for accounting purposes.
          </p>
        </div>
      ),
    },
    {
      id: "system-settings",
      title: "System Settings",
      icon: <FiSettings />,
      content: (
        <div>
          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Configuration Options
          </h4>
          <p className="mb-4">
            As an administrator, you can configure various system settings:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Set the per-kilometer rate (currently CHF 0.70)</li>
            <li>Adjust expense categories</li>
            <li>Configure approval workflows</li>
            <li>Set up system notifications</li>
          </ul>

          <h4 className="text-lg font-medium mb-3 text-[#3d348b]">
            Database Management
          </h4>
          <p className="mb-4">
            The system allows for basic database management:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Backup and restore functionality</li>
            <li>Data export options</li>
            <li>System logs and audit trails</li>
          </ul>
        </div>
      ),
    },
  ];

  // Combine sections based on user role
  const sections = isAdmin
    ? [...commonSections, ...adminSections]
    : commonSections;

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="mb-8 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-2xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#f7b801] opacity-10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10 flex items-center">
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-xl flex items-center justify-center text-white mr-6 shadow-lg backdrop-blur-sm">
              <FiBook className="text-[#f7b801] text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Documentation</h1>
              <p className="text-white text-opacity-80">
                Comprehensive guide to using the Expense Management System
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Documentation Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] px-4 py-3">
              <h3 className="text-white font-medium">Contents</h3>
            </div>
            <div className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                      expandedSection === section.id
                        ? "bg-[#f7b801]/10 text-[#3d348b]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`mr-3 ${
                          expandedSection === section.id
                            ? "text-[#f7b801]"
                            : "text-gray-400"
                        }`}
                      >
                        {section.icon}
                      </span>
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <span>
                      {expandedSection === section.id ? (
                        <FiChevronDown />
                      ) : (
                        <FiChevronRight />
                      )}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: expandedSection === section.id ? 1 : 0,
                  height: expandedSection === section.id ? "auto" : 0,
                  display: expandedSection === section.id ? "block" : "none",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 pb-2 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-[#3d348b] flex items-center">
                    <span className="mr-3 text-[#f7b801]">{section.icon}</span>
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-600">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <motion.div
        className="mt-8 bg-gradient-to-r from-[#f7b801]/10 to-[#f35b04]/10 rounded-xl p-6 border border-[#f7b801]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-[#3d348b] mb-3 flex items-center">
          <FiHelpCircle className="mr-2 text-[#f35b04]" />
          Need Additional Help?
        </h3>
        <p className="text-gray-600 mb-4">
          If you need further assistance, please contact the IT support team at{" "}
          <span className="text-[#3d348b] font-medium">
            support@aussendienst.ch
          </span>{" "}
          or call{" "}
          <span className="text-[#3d348b] font-medium">+41 44 123 4567</span>.
        </p>
        <p className="text-gray-600">
          Support hours: Monday to Friday, 08:00 - 17:00 CET
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Documentation;
