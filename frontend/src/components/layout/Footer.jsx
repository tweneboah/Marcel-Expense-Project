import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaChartLine,
  FaFileExport,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#3d348b] to-[#7678ed] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <Link 
              to="/" 
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center mb-6 hover:opacity-80 transition-opacity"
            >
              <FaMoneyBillWave className="text-[#f7b801] text-3xl mr-2" />
              <span className="text-2xl font-bold">AussenDienst</span>
            </Link>
            <p className="text-white/80 mb-6">
              Simplifying expense management for sales representatives on the
              road.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#f7b801" }}
                className="hover:text-[#f7b801] transition-colors"
              >
                <FaFacebookF />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#f7b801" }}
                className="hover:text-[#f7b801] transition-colors"
              >
                <FaTwitter />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#f7b801" }}
                className="hover:text-[#f7b801] transition-colors"
              >
                <FaLinkedinIn />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#f7b801" }}
                className="hover:text-[#f7b801] transition-colors"
              >
                <FaInstagram />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-white/80 hover:text-[#f7b801] transition-colors flex items-center"
                >
                  <span className="mr-2">→</span> Home
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-white/80 hover:text-[#f7b801] transition-colors flex items-center"
                >
                  <span className="mr-2">→</span> Features
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-white/80 hover:text-[#f7b801] transition-colors flex items-center"
                >
                  <span className="mr-2">→</span> Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-white/80 hover:text-[#f7b801] transition-colors flex items-center"
                >
                  <span className="mr-2">→</span> Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Key Features</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-white/80">
                <FaMapMarkedAlt className="text-[#f7b801] mr-2" /> Google Maps
                Integration
              </li>
              <li className="flex items-center text-white/80">
                <FaChartLine className="text-[#f7b801] mr-2" /> Analytics &
                Reporting
              </li>
              <li className="flex items-center text-white/80">
                <FaFileExport className="text-[#f7b801] mr-2" /> Export
                Capabilities
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div id="contact">
            <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-white/80">
                <FaMapMarkerAlt className="text-[#f7b801] mr-2 mt-1 flex-shrink-0" />
                <span>123 Business Street, Zurich, Switzerland, 8001</span>
              </li>
              <li className="flex items-center text-white/80">
                <FaPhoneAlt className="text-[#f7b801] mr-2 flex-shrink-0" />
                <span>+41 123 456 7890</span>
              </li>
              <li className="flex items-center text-white/80">
                <FaEnvelope className="text-[#f7b801] mr-2 flex-shrink-0" />
                <span>info@aussendienst.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AussenDienst GmbH. All rights
            reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link
              to="/"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
