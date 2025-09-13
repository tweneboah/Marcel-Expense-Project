import React from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiXCircle,
} from "react-icons/fi";

const VARIANTS = {
  success: {
    icon: FiCheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
  },
  error: {
    icon: FiXCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
  },
  warning: {
    icon: FiAlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
  },
  info: {
    icon: FiInfo,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-500",
  },
};

export const Alert = ({
  children,
  title,
  variant = "info",
  className = "",
  onClose,
}) => {
  const styles = VARIANTS[variant] || VARIANTS.info;
  const AlertIcon = styles.icon;

  return (
    <div
      className={`${styles.bgColor} border ${styles.borderColor} ${styles.textColor} px-4 py-3 rounded relative mb-4 ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertIcon
            className={`h-5 w-5 ${styles.iconColor}`}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${styles.textColor} hover:${styles.bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${styles.bgColor} focus:ring-${styles.textColor}`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <FiXCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
