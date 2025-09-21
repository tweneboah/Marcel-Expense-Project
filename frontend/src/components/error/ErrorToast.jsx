import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiAlertTriangle, 
  FiAlertCircle, 
  FiInfo, 
  FiCheckCircle,
  FiWifi,
  FiShield,
  FiLock
} from 'react-icons/fi';
import { ERROR_TYPES, ERROR_SEVERITY } from '../../utils/errorHandler';
import { useError } from '../../context/ErrorContext';

const ErrorToast = () => {
  const { errors, removeError } = useError();
  const [visibleErrors, setVisibleErrors] = useState([]);

  // Filter errors that should be shown as toasts
  useEffect(() => {
    const toastErrors = errors.filter(error => 
      !error.persistent && 
      error.severity !== ERROR_SEVERITY.CRITICAL
    );
    setVisibleErrors(toastErrors);
  }, [errors]);

  const getErrorIcon = (error) => {
    switch (error.type) {
      case ERROR_TYPES.NETWORK:
        return <FiWifi className="w-5 h-5" />;
      case ERROR_TYPES.AUTHENTICATION:
        return <FiLock className="w-5 h-5" />;
      case ERROR_TYPES.AUTHORIZATION:
        return <FiShield className="w-5 h-5" />;
      case ERROR_TYPES.VALIDATION:
        return <FiAlertCircle className="w-5 h-5" />;
      case ERROR_TYPES.SERVER:
        return <FiAlertTriangle className="w-5 h-5" />;
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getErrorStyles = (error) => {
    switch (error.severity) {
      case ERROR_SEVERITY.HIGH:
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500',
          button: 'text-red-600 hover:text-red-800'
        };
      case ERROR_SEVERITY.MEDIUM:
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
          button: 'text-yellow-600 hover:text-yellow-800'
        };
      case ERROR_SEVERITY.LOW:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          button: 'text-blue-600 hover:text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500',
          button: 'text-gray-600 hover:text-gray-800'
        };
    }
  };

  const handleDismiss = (errorId) => {
    removeError(errorId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {visibleErrors.map((error) => {
          const styles = getErrorStyles(error);
          
          return (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                ${styles.bg} ${styles.text}
                border rounded-lg shadow-lg p-4 relative
                max-w-sm w-full
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                  {getErrorIcon(error)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {error.userMessage || error.message}
                  </div>
                  
                  {error.context?.component && (
                    <div className="text-xs opacity-75 mt-1">
                      in {error.context.component}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleDismiss(error.id)}
                  className={`
                    ${styles.button}
                    flex-shrink-0 p-1 rounded-md
                    hover:bg-black hover:bg-opacity-10
                    transition-colors duration-200
                  `}
                  aria-label="Dismiss error"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              
              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Success toast component
export const SuccessToast = ({ message, onDismiss, autoHide = true }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="
            bg-green-50 border-green-200 text-green-800
            border rounded-lg shadow-lg p-4 relative
            max-w-sm w-full
          "
        >
          <div className="flex items-start space-x-3">
            <div className="text-green-500 flex-shrink-0 mt-0.5">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {message}
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="
                text-green-600 hover:text-green-800
                flex-shrink-0 p-1 rounded-md
                hover:bg-black hover:bg-opacity-10
                transition-colors duration-200
              "
              aria-label="Dismiss success message"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          {autoHide && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;