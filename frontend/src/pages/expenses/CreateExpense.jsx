import ExpenseForm from "../../components/forms/ExpenseForm";
import Card from "../../components/ui/Card";
import { motion } from "framer-motion";
import {
  FiPlusCircle,
  FiDollarSign,
  FiTrendingUp,
  FiMap,
} from "react-icons/fi";
import { FaRoute, FaCarSide } from "react-icons/fa";
import useSettingsValue from "../../hooks/useSettingsValue";

const CreateExpense = () => {
  // Get the current cost per kilometer from settings
  const [costPerKm] = useSettingsValue("costPerKilometer", 0.7);

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with gradient background */}
      <motion.div
        className="relative mb-10 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-xl shadow-lg overflow-hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="absolute right-0 top-0 h-full w-1/3 overflow-hidden">
          <svg
            className="absolute right-0 top-0 h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L100,0 Q50,50 100,100 L0,100 Z"
              fill="url(#headerGradient)"
              opacity="0.15"
            />
            <defs>
              <linearGradient
                id="headerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f7b801" />
                <stop offset="100%" stopColor="#f35b04" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="p-8 text-white relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <div className="bg-white/10 p-4 rounded-full">
                <FaCarSide className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create New Expense</h1>
                <p className="text-white/80 mt-1">
                  Record your travel expenses with ease
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white/10 p-3 rounded-lg text-white/90">
              <div className="flex items-center gap-2 px-3 py-2">
                <FaRoute className="text-[#f7b801]" />
                <span className="text-sm">Record Route</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <FiTrendingUp className="text-[#f7b801]" />
                <span className="text-sm">Calculate Cost</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <FiDollarSign className="text-[#f7b801]" />
                <span className="text-sm">Submit Expense</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="border-none shadow-xl rounded-xl overflow-hidden">
          <div className="p-1">
            <div className="bg-gradient-to-r from-[#3d348b]/5 to-[#7678ed]/5 rounded-lg">
              <div className="p-6">
                <ExpenseForm />
              </div>
            </div>
          </div>
        </Card>

        {/* Helpful tips card */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-[#f7b801]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-[#3d348b] mb-2 flex items-center gap-2">
            <FiMap className="text-[#f7b801]" />
            Helpful Tips
          </h3>
          <ul className="text-gray-600 space-y-2 mt-3">
            <li className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 rounded-full bg-[#f7b801]/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#f7b801]"></div>
              </div>
              <span>
                For accurate distance calculation, provide exact addresses or
                place names.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 rounded-full bg-[#f7b801]/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#f7b801]"></div>
              </div>
              <span>
                You can add multiple waypoints if your journey included stops.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 rounded-full bg-[#f7b801]/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#f7b801]"></div>
              </div>
              <span>
                The system automatically calculates costs based on distance at
                the standard rate of {costPerKm.toFixed(2)} CHF per kilometer.
              </span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CreateExpense;
