import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaMobileAlt,
  FaFileExport,
  FaRoute,
  FaUsersCog,
  FaCar,
  FaCalendarAlt,
  FaFilter,
  FaCloudDownloadAlt,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Footer from "../../components/layout/Footer";

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  // Add ESC key functionality to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && activeFeature) {
        setActiveFeature(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [activeFeature]);

  // Main feature cards with detailed descriptions
  const featureCards = [
    {
      id: "expense-tracking",
      title: "Expense Tracking",
      icon: <FaMoneyBillWave />,
      color: "#3d348b",
      description:
        "Comprehensive CRUD operations for managing all your travel expenses.",
      details: [
        "Create, update, and delete expense entries",
        "Search and filter expenses by date, amount, and status",
        "Batch operations for efficient management",
        "Custom categorization for better organization",
        "Notes and attachments for detailed documentation",
      ],
    },
    {
      id: "maps-integration",
      title: "Google Maps Integration",
      icon: <FaMapMarkedAlt />,
      color: "#7678ed",
      description:
        "Seamlessly calculate distances with our Google Maps integration.",
      details: [
        "Auto-completion for addresses and locations",
        "Real-time distance calculation between points",
        "Support for waypoints and multiple stops",
        "Visual route display on interactive maps",
        "Trip optimization for the most efficient routes",
      ],
    },
    {
      id: "auto-calculation",
      title: "Automatic Calculations",
      icon: <FaRoute />,
      color: "#f7b801",
      description:
        "Automatically calculates expenses based on distance and preset rates.",
      details: [
        "Distance multiplied by company's preset rate (CHF 0.70/km)",
        "Instant recalculation when routes or rates change",
        "Support for different rate tiers based on distance",
        "Automatic subtotals and totals for reports",
        "Currency conversion for international travel",
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      icon: <FaChartLine />,
      color: "#f35b04",
      description:
        "Comprehensive visual reports for better expense management.",
      details: [
        "Monthly, quarterly, and yearly expense breakdowns",
        "Category-based expense analysis",
        "Interactive charts and graphs for data visualization",
        "Expense trend analysis over time",
        "Comparative analysis between different periods",
      ],
    },
    {
      id: "mobile",
      title: "Mobile Responsive",
      icon: <FaMobileAlt />,
      color: "#3d348b",
      description: "Access your expenses anywhere, anytime on any device.",
      details: [
        "Fully responsive design for all screen sizes",
        "Native-like experience on mobile devices",
        "Offline capability for entering expenses without internet",
        "Touch-optimized interface for mobile use",
        "Quick actions for on-the-go expense entry",
      ],
    },
    {
      id: "export",
      title: "Export & Integration",
      icon: <FaFileExport />,
      color: "#7678ed",
      description:
        "Export your expense data in various formats for accounting.",
      details: [
        "PDF export for formal reports and documentation",
        "CSV export for data analysis in spreadsheets",
        "Direct integration with accounting software",
        "Scheduled automated exports",
        "Custom export templates for different needs",
      ],
    },
    {
      id: "user-roles",
      title: "User Role Management",
      icon: <FaUsersCog />,
      color: "#f7b801",
      description: "Different access levels for sales reps and administrators.",
      details: [
        "Role-based access control (Admin and Sales Rep)",
        "Custom dashboards for different user roles",
        "Hierarchical approval workflows",
        "Activity logging and audit trails",
        "Delegated expense management for teams",
      ],
    },
    {
      id: "planning",
      title: "Trip Planning",
      icon: <FaCar />,
      color: "#f35b04",
      description:
        "Plan your business trips with our integrated planning tools.",
      details: [
        "Interactive route planning with multiple stops",
        "Estimated cost calculation before trips",
        "Integration with calendar for scheduling",
        "Trip templates for recurring journeys",
        "Collaborative planning for team trips",
      ],
    },
    {
      id: "security",
      title: "Enterprise Security",
      icon: <FaShieldAlt />,
      color: "#3d348b",
      description: "Enterprise-grade security for your sensitive expense data.",
      details: [
        "Secure authentication with password hashing",
        "Role-based permission system",
        "Data encryption for sensitive information",
        "Regular security audits and updates",
        "Compliance with data protection regulations",
      ],
    },
  ];

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
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
    hover: {
      y: -10,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 200, damping: 15 },
    },
  };

  const featureDetailVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 },
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10">
      {/* Navigation */}
      <nav className="bg-white shadow-md py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <FaMoneyBillWave className="text-[#3d348b] text-3xl mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-transparent bg-clip-text">
                AussenDienst
              </span>
            </motion.div>
          </Link>
          <div className="hidden md:flex space-x-6 font-medium">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#3d348b] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="text-[#3d348b] border-b-2 border-[#3d348b] pb-1"
            >
              Features
            </Link>
            <a
              href="#contact"
              className="text-gray-700 hover:text-[#3d348b] transition-colors"
            >
              Contact
            </a>
          </div>
          <div className="flex space-x-3">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#3d348b] border-2 border-[#3d348b] px-4 py-2 rounded-lg font-medium"
              >
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#3d348b] text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-[#3d348b]/30"
              >
                Register
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Powerful{" "}
              <span className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-transparent bg-clip-text">
                Features
              </span>{" "}
              for
              <span className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-transparent bg-clip-text">
                {" "}
                Efficient
              </span>{" "}
              Expense Management
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Discover how our expense management solution simplifies tracking,
              reporting, and reimbursement of travel expenses for AussenDienst
              sales representatives.
            </motion.p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featureCards.map((feature) => (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                whileHover="hover"
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:cursor-pointer`}
                onClick={() => setActiveFeature(feature)}
              >
                <div
                  className={`h-2`}
                  style={{ backgroundColor: feature.color }}
                ></div>
                <div className="p-6">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white mb-4`}
                    style={{ backgroundColor: feature.color }}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div
                    className="flex items-center text-sm font-medium"
                    style={{ color: feature.color }}
                  >
                    <span>Learn more</span>
                    <FaArrowRight className="ml-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Feature View */}
          {activeFeature && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFeature(null)}
            >
              <motion.div
                className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                variants={featureDetailVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: activeFeature.color }}
                ></div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white mr-4`}
                        style={{ backgroundColor: activeFeature.color }}
                      >
                        <span className="text-3xl">{activeFeature.icon}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800">
                        {activeFeature.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveFeature(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    {activeFeature.description}
                  </p>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Key Capabilities:
                  </h3>
                  <ul className="space-y-3 mb-8">
                    {activeFeature.details.map((detail, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <FaCheckCircle
                          className="mt-1 mr-3 flex-shrink-0"
                          style={{ color: activeFeature.color }}
                        />
                        <span className="text-gray-700">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="flex justify-center mt-8">
                    <Link to="/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#3d348b]/30"
                      >
                        Get Started with This Feature
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Feature Breakdown Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Expense Management Solution?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive expense management platform is designed
              specifically for sales representatives who are constantly on the
              road.
            </p>
          </motion.div>

          <div className="space-y-24">
            {/* Section 1: Expense Tracking */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 w-14 h-14 rounded-full bg-[#3d348b]/10 flex items-center justify-center">
                  <FaMoneyBillWave className="text-[#3d348b] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Effortless Expense Tracking
                </h3>
                <p className="text-gray-600 mb-6">
                  Record and manage all your travel expenses in one place. Our
                  intuitive interface makes it easy to create, edit, and
                  organize your expenses.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#3d348b] mt-1 mr-3 flex-shrink-0" />
                    <span>Quick entry forms for common expense types</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#3d348b] mt-1 mr-3 flex-shrink-0" />
                    <span>Organize expenses by category, date, or project</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#3d348b] mt-1 mr-3 flex-shrink-0" />
                    <span>
                      Search and filter capabilities for easy retrieval
                    </span>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#3d348b] to-[#7678ed] rounded-xl p-3"
              >
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <img
                    src="https://placehold.co/600x400/3d348b/FFFFFF/png?text=Expense+Tracking+Interface"
                    alt="Expense tracking interface"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </motion.div>
            </div>

            {/* Section 2: Google Maps Integration */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#7678ed] to-[#3d348b] rounded-xl p-3 md:order-1 order-2"
              >
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <img
                    src="https://placehold.co/600x400/7678ed/FFFFFF/png?text=Maps+Integration"
                    alt="Google Maps integration"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="md:order-2 order-1"
              >
                <div className="mb-4 w-14 h-14 rounded-full bg-[#7678ed]/10 flex items-center justify-center">
                  <FaMapMarkedAlt className="text-[#7678ed] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Seamless Google Maps Integration
                </h3>
                <p className="text-gray-600 mb-6">
                  Our platform integrates with Google Maps to automatically
                  calculate distances between locations, saving you time and
                  ensuring accuracy.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#7678ed] mt-1 mr-3 flex-shrink-0" />
                    <span>Address auto-completion for faster entry</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#7678ed] mt-1 mr-3 flex-shrink-0" />
                    <span>Visual route display with interactive maps</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#7678ed] mt-1 mr-3 flex-shrink-0" />
                    <span>Support for multi-stop journeys and waypoints</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Section 3: Reporting & Analytics */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 w-14 h-14 rounded-full bg-[#f7b801]/10 flex items-center justify-center">
                  <FaChartLine className="text-[#f7b801] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Comprehensive Reporting & Analytics
                </h3>
                <p className="text-gray-600 mb-6">
                  Gain insights into your travel expenses with detailed reports
                  and visualizations that help you understand spending patterns.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#f7b801] mt-1 mr-3 flex-shrink-0" />
                    <span>
                      Monthly, quarterly, and annual expense summaries
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#f7b801] mt-1 mr-3 flex-shrink-0" />
                    <span>Visual charts for expense trends and breakdowns</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#f7b801] mt-1 mr-3 flex-shrink-0" />
                    <span>
                      Exportable reports for accounting and tax purposes
                    </span>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#f7b801] to-[#f35b04] rounded-xl p-3"
              >
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <img
                    src="https://placehold.co/600x400/f7b801/FFFFFF/png?text=Analytics+Dashboard"
                    alt="Analytics dashboard"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#3d348b] to-[#7678ed]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Simplify Your Expense Management?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Join AussenDienst's sales representatives who are already saving
              time and reducing errors with our expense management solution.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#3d348b] px-8 py-3 rounded-lg font-medium shadow-lg"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium"
                >
                  Login
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          to="/"
          onClick={() => {
            // Scroll to top when navigating to home
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
          className="flex items-center text-[#3d348b] hover:text-[#7678ed] transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Features;
