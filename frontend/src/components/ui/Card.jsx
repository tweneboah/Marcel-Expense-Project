import React from "react";
import { motion } from "framer-motion";

const Card = ({
  children,
  title,
  className = "",
  headerActions,
  noPadding = false,
  animate = false,
}) => {
  const cardContent = (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-[#FCA311]">{title}</h3>
          {headerActions && (
            <div className="flex space-x-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default Card;
