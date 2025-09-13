import React from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex justify-center" aria-label="Pagination">
      <ul className="inline-flex items-center -space-x-px">
        {/* Previous button */}
        <li>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 ml-0 leading-tight rounded-l-md border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                : "bg-white text-[#3d348b] hover:bg-[#3d348b]/5 border-gray-300"
            }`}
            aria-label="Previous"
          >
            <FiChevronLeft className="w-5 h-5" />
          </motion.button>
        </li>

        {/* Page numbers */}
        {pages.map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 leading-tight border border-gray-300 bg-white text-gray-500">
                ...
              </span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageClick(page)}
                className={`px-3 py-2 leading-tight border hover:bg-[#3d348b]/5 ${
                  page === currentPage
                    ? "bg-[#3d348b] text-white border-[#3d348b]"
                    : "bg-white text-[#3d348b] border-gray-300"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </motion.button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-2 leading-tight rounded-r-md border ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                : "bg-white text-[#3d348b] hover:bg-[#3d348b]/5 border-gray-300"
            }`}
            aria-label="Next"
          >
            <FiChevronRight className="w-5 h-5" />
          </motion.button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
