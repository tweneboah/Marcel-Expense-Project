import React from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiCheck,
  FiCheckCircle,
  FiTrendingUp,
  FiArrowRight,
  FiDollarSign,
} from "react-icons/fi";

const defaultSteps = [
  {
    id: 1,
    name: "Start",
    description: "Starting point",
    icon: <FiMapPin className="h-5 w-5" />,
    color: "#7678ed",
  },
  {
    id: 2,
    name: "Confirm",
    description: "Confirm start",
    icon: <FiCheckCircle className="h-5 w-5" />,
    color: "#f7b801",
  },
  {
    id: 3,
    name: "Destination",
    description: "Destination point",
    icon: <FiMapPin className="h-5 w-5" />,
    color: "#7678ed",
  },
  {
    id: 4,
    name: "Waypoints",
    description: "Add stops",
    icon: <FiArrowRight className="h-5 w-5" />,
    color: "#f7b801",
  },
  {
    id: 5,
    name: "Calculate",
    description: "Calculate route",
    icon: <FiTrendingUp className="h-5 w-5" />,
    color: "#3d348b",
  },
  {
    id: 6,
    name: "Details",
    description: "Expense details",
    icon: <FiDollarSign className="h-5 w-5" />,
    color: "#f35b04",
  },
];

const Stepper = ({ currentStep, steps = defaultSteps }) => {
  return (
    <div className="py-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Progress">
          <ol role="list" className="overflow-x-auto flex md:space-x-8 pb-4">
            {steps.map((step, index) => (
              <motion.li
                key={step.name}
                className="md:flex-1 min-w-[120px] relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: (index + 1) * 0.1,
                }}
              >
                <div
                  className={`flex flex-col border-l-0 border-t-4 pb-0 pt-4 ${
                    index + 1 < currentStep
                      ? `border-[${step.color}]`
                      : index + 1 === currentStep
                      ? `border-[${step.color}]`
                      : "border-gray-200"
                  }`}
                  style={{
                    borderTopColor:
                      index + 1 <= currentStep ? step.color : "#e5e7eb",
                  }}
                >
                  <div className="flex items-center">
                    <div
                      className={`relative flex items-center justify-center h-9 w-9 rounded-full mr-2 transition-all duration-300`}
                      style={{
                        backgroundColor:
                          index + 1 <= currentStep ? step.color : "#e5e7eb",
                        color: index + 1 <= currentStep ? "#fff" : "#94a3b8",
                      }}
                    >
                      {index + 1 < currentStep ? (
                        <FiCheck className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                      {index + 1 === currentStep && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              "0 0 0 0px rgba(255,255,255,0)",
                              "0 0 0 4px rgba(255,255,255,0.2)",
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            repeatType: "reverse",
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color:
                          index + 1 <= currentStep ? step.color : "#94a3b8",
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-10">
                    <span
                      className={`text-sm font-medium ${
                        index + 1 <= currentStep
                          ? "text-[#3d348b]"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {step.description}
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Stepper;
