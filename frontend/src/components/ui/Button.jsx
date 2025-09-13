import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  isLoading = false,
  to,
  className = "",
  icon,
  ...rest
}) => {
  // Determine button classes based on variant, size, and disabled state
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium shadow-sm focus:outline-none transition-all";

  let variantClasses = "";
  switch (variant) {
    case "primary":
      variantClasses =
        "bg-[#3d348b] text-white hover:bg-[#3d348b]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#3d348b]/50";
      break;
    case "secondary":
      variantClasses =
        "bg-white text-[#3d348b] border border-[#3d348b]/20 hover:bg-[#3d348b]/5 focus:ring-2 focus:ring-offset-2 focus:ring-[#3d348b]/30";
      break;
    case "accent":
      variantClasses =
        "bg-[#f7b801] text-[#3d348b] hover:bg-[#f7b801]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#f7b801]/50";
      break;
    case "danger":
      variantClasses =
        "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500";
      break;
    case "success":
      variantClasses =
        "bg-[#7678ed] text-white hover:bg-[#7678ed]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#7678ed]/50";
      break;
    case "highlight":
      variantClasses =
        "bg-[#f35b04] text-white hover:bg-[#f35b04]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#f35b04]/50";
      break;
    default:
      variantClasses =
        "bg-[#3d348b] text-white hover:bg-[#3d348b]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#3d348b]/50";
  }

  let sizeClasses = "";
  switch (size) {
    case "xs":
      sizeClasses = "px-2.5 py-1.5 text-xs";
      break;
    case "sm":
      sizeClasses = "px-3 py-2 text-sm";
      break;
    case "md":
      sizeClasses = "px-4 py-2.5 text-sm";
      break;
    case "lg":
      sizeClasses = "px-6 py-3 text-base";
      break;
    case "xl":
      sizeClasses = "px-8 py-4 text-lg";
      break;
    default:
      sizeClasses = "px-4 py-2.5 text-sm";
  }

  const disabledClasses =
    disabled || isLoading ? "opacity-60 cursor-not-allowed" : "";

  const buttonClasses =
    `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim();

  const buttonContent = (
    <>
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </>
  );

  // If to prop is provided, render a Link component
  if (to) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link to={to} className={buttonClasses} {...rest}>
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  // Otherwise, render a button element
  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      {...rest}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
