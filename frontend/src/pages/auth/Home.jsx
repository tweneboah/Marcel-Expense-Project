import React from "react";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaCar,
  FaMapMarkedAlt,
  FaFileExport,
  FaUsersCog,
  FaLock,
  FaMobileAlt,
  FaQuestion,
  FaCheck,
  FaArrowRight,
  FaBuilding,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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
          <div className="hidden md:flex space-x-6 font-medium">
            <a
              href="#features"
              className="text-gray-700 hover:text-[#3d348b] transition-colors"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-gray-700 hover:text-[#3d348b] transition-colors"
            >
              Benefits
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-[#3d348b] transition-colors"
            >
              About
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
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Simplify Your{" "}
              <span className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-transparent bg-clip-text">
                Expense Management
              </span>{" "}
              Journey
            </h1>
            <p className="mt-6 text-gray-600 text-lg">
              AussenDienst's expense app automates your travel expense
              calculations, saving you time and reducing errors.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#3d348b]/30 w-full sm:w-auto"
                >
                  Get Started
                </motion.button>
              </Link>
              <a href="#features">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white border-2 border-[#7678ed] text-[#3d348b] px-8 py-3 rounded-lg font-medium w-full sm:w-auto"
                >
                  Learn More
                </motion.button>
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#7678ed] to-[#3d348b] rounded-2xl shadow-2xl p-4 md:p-6 relative z-10">
              <div className="bg-white rounded-xl p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Travel Expense
                    </h3>
                    <p className="text-sm text-gray-500">May 15, 2024</p>
                  </div>
                  <div className="bg-[#f7b801]/10 p-2 rounded-lg">
                    <FaCar className="text-[#f7b801] text-xl" />
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <FaMapMarkedAlt className="text-[#3d348b] mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">Zurich</p>
                    </div>
                  </div>
                  <div className="border-l-2 border-dotted border-[#7678ed] h-6 ml-[0.5rem]"></div>
                  <div className="flex items-center">
                    <FaMapMarkedAlt className="text-[#f35b04] mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">Bern</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-semibold">124 km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-semibold text-[#3d348b]">CHF 86.80</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-10 -right-5 bg-[#f7b801] h-24 w-24 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute bottom-10 -left-5 bg-[#f35b04] h-16 w-16 rounded-full opacity-30 blur-xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our expense app helps AussenDienst sales representatives manage
              travel expenses efficiently with these key features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-6 rounded-xl"
            >
              <div className="bg-[#3d348b]/10 p-3 rounded-lg inline-block mb-4">
                <FaMapMarkedAlt className="text-[#3d348b] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Google Maps Integration
              </h3>
              <p className="text-gray-600">
                Automatically calculate distances with our seamless Google Maps
                integration. No more manual calculations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#f7b801]/5 to-[#f35b04]/10 p-6 rounded-xl"
            >
              <div className="bg-[#f7b801]/10 p-3 rounded-lg inline-block mb-4">
                <FaMoneyBillWave className="text-[#f7b801] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Automatic Expense Calculations
              </h3>
              <p className="text-gray-600">
                Route distances are automatically multiplied by the company's
                predefined cost rate per kilometer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#7678ed]/5 to-[#3d348b]/10 p-6 rounded-xl"
            >
              <div className="bg-[#7678ed]/10 p-3 rounded-lg inline-block mb-4">
                <FaChartLine className="text-[#7678ed] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Graphical Reports</h3>
              <p className="text-gray-600">
                View your expenses visualized through intuitive charts and
                graphs for monthly, quarterly, and yearly periods.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-6 rounded-xl"
            >
              <div className="bg-[#3d348b]/10 p-3 rounded-lg inline-block mb-4">
                <FaFileExport className="text-[#3d348b] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF & CSV Export</h3>
              <p className="text-gray-600">
                Export your expense reports in PDF or CSV format for easy
                sharing with finance departments or for your records.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#f7b801]/5 to-[#f35b04]/10 p-6 rounded-xl"
            >
              <div className="bg-[#f7b801]/10 p-3 rounded-lg inline-block mb-4">
                <FaUsersCog className="text-[#f7b801] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Different access levels for administrators and sales
                representatives, ensuring proper control and data security.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#7678ed]/5 to-[#3d348b]/10 p-6 rounded-xl"
            >
              <div className="bg-[#7678ed]/10 p-3 rounded-lg inline-block mb-4">
                <FaMobileAlt className="text-[#7678ed] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Responsive</h3>
              <p className="text-gray-600">
                Access your expense management system from any device - desktop,
                tablet, or mobile phone with our responsive design.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/features"
              onClick={() => {
                // Scroll to top when navigating to features page
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#3d348b]/30 flex items-center mx-auto"
              >
                <span>View All Features</span>
                <FaArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-16 bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Benefits for Sales Representatives
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our expense app delivers substantial advantages to AussenDienst's
              field sales team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#3d348b]/10 p-2 rounded-lg mr-4 mt-1">
                    <FaCheck className="text-[#3d348b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Time Savings</h3>
                    <p className="text-gray-600">
                      No more manual calculations or paperwork - submit expenses
                      in minutes, not hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#7678ed]/10 p-2 rounded-lg mr-4 mt-1">
                    <FaCheck className="text-[#7678ed]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Reduced Errors
                    </h3>
                    <p className="text-gray-600">
                      Automatic calculations eliminate human error in distance
                      and expense computation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#f7b801]/10 p-2 rounded-lg mr-4 mt-1">
                    <FaCheck className="text-[#f7b801]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Faster Reimbursements
                    </h3>
                    <p className="text-gray-600">
                      Digital submission leads to quicker approval and faster
                      payment processing.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#f35b04]/10 p-2 rounded-lg mr-4 mt-1">
                    <FaCheck className="text-[#f35b04]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Enhanced Transparency
                    </h3>
                    <p className="text-gray-600">
                      Track all your submitted expenses and their status in
                      real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#3d348b]/10 p-2 rounded-lg mr-4 mt-1">
                    <FaCheck className="text-[#3d348b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Insights and Analytics
                    </h3>
                    <p className="text-gray-600">
                      Gain valuable insights into your travel patterns and
                      expense trends over time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#7678ed]/10 p-2 rounded-lg mr-4 mt-1">
                    <FaCheck className="text-[#7678ed]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Always Accessible
                    </h3>
                    <p className="text-gray-600">
                      Submit and review expenses anytime, anywhere using any
                      device.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Managing your travel expenses has never been easier with our
              simple 3-step process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              <div className="bg-[#3d348b] w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <div className="hidden md:block absolute top-6 left-[55%] w-full h-0.5 bg-gradient-to-r from-[#3d348b] to-[#7678ed]"></div>
              <h3 className="text-xl font-semibold mb-3">
                Enter Journey Details
              </h3>
              <p className="text-gray-600">
                Input your starting point and destination. Our Google Maps
                integration will auto-complete locations and calculate the
                distance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              <div className="bg-[#7678ed] w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <div className="hidden md:block absolute top-6 left-[55%] w-full h-0.5 bg-gradient-to-r from-[#7678ed] to-[#f7b801]"></div>
              <h3 className="text-xl font-semibold mb-3">
                Review Calculations
              </h3>
              <p className="text-gray-600">
                The system automatically calculates your expense based on
                distance and the company's predefined rate per kilometer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-[#f7b801] w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Submit and Track</h3>
              <p className="text-gray-600">
                Submit your expense with a single click and track its status.
                Generate reports and export data whenever needed.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-16 bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About AussenDienst GmbH
              </h2>
              <p className="text-gray-600 mb-4">
                AussenDienst GmbH is a leading marketing service provider
                employing sales representatives throughout Switzerland. We
                believe in empowering our team with the best tools to succeed.
              </p>
              <p className="text-gray-600 mb-4">
                Our expense management application was developed specifically
                for our field sales team to simplify their expense reporting
                process and ensure timely reimbursements.
              </p>
              <p className="text-gray-600">
                By automating travel expense calculations, we've streamlined
                operations, reduced errors, and allowed our representatives to
                focus on what they do best – serving our clients.
              </p>
              <div className="mt-8">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <FaBuilding className="text-[#3d348b] mr-2" />
                    <span className="font-medium">Founded 2010</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsersCog className="text-[#f7b801] mr-2" />
                    <span className="font-medium">50+ Sales Reps</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Team working together"
                  className="object-cover w-full h-full rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3d348b]/60 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our expense management
              application.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-6 rounded-xl"
            >
              <div className="flex items-start">
                <div className="bg-[#3d348b]/10 p-2 rounded-lg mr-4 shrink-0">
                  <FaQuestion className="text-[#3d348b]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    How is the distance calculated?
                  </h3>
                  <p className="text-gray-600">
                    We use Google Maps API to calculate the most efficient route
                    between your starting point and destination, ensuring
                    accurate distance measurement for your expenses.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-6 rounded-xl"
            >
              <div className="flex items-start">
                <div className="bg-[#7678ed]/10 p-2 rounded-lg mr-4 shrink-0">
                  <FaQuestion className="text-[#7678ed]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    What is the current rate per kilometer?
                  </h3>
                  <p className="text-gray-600">
                    The current reimbursement rate is set by AussenDienst
                    management. You can find the current rate in your dashboard
                    after logging in.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-6 rounded-xl"
            >
              <div className="flex items-start">
                <div className="bg-[#f7b801]/10 p-2 rounded-lg mr-4 shrink-0">
                  <FaQuestion className="text-[#f7b801]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Can I submit expenses for past dates?
                  </h3>
                  <p className="text-gray-600">
                    Yes, you can submit expenses for any date within the current
                    fiscal year. For older expenses, please contact your
                    administrator.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-6 rounded-xl"
            >
              <div className="flex items-start">
                <div className="bg-[#f35b04]/10 p-2 rounded-lg mr-4 shrink-0">
                  <FaQuestion className="text-[#f35b04]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Is my data secure?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely. We employ industry-standard encryption and
                    security practices to protect your data. Your information is
                    only accessible to you and authorized administrators.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#3d348b] to-[#7678ed]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Simplify Your Expense Management?
            </h2>
            <p className="text-white/80 text-lg max-w-3xl mx-auto mb-8">
              Join AussenDienst's sales representatives who are already saving
              time and reducing errors with our expense app.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#3d348b] px-8 py-3 rounded-lg font-medium shadow-xl"
              >
                Get Started Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-[#f7b801] text-2xl mr-2" />
                <span className="text-xl font-bold">AussenDienst</span>
              </div>
              <p className="mt-2 text-gray-400 max-w-md">
                Simplifying expense management for sales representatives across
                Switzerland.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#f7b801]">
                  Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#features"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#benefits"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Benefits
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      About
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#f7b801]">
                  Legal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} AussenDienst GmbH. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
