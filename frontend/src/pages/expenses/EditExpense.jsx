import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExpenseForm from "../../components/forms/ExpenseForm";
import Card from "../../components/ui/Card";
import { motion } from "framer-motion";
import { FiEdit, FiAlertTriangle } from "react-icons/fi";
import { getExpenseById } from "../../api/expenseApi";
import { useExpenseRoutes } from "../../utils/routeHelpers";

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routes = useExpenseRoutes();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const data = await getExpenseById(id);
        setExpense(data);
      } catch (err) {
        // Error handled by error context
        setError("Failed to load expense data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleCancel = () => {
    navigate(routes.detail(id));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FCA311]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p>{error}</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Back to Expense Details
          </button>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Not Found</h2>
          </div>
          <p>The expense you're trying to edit could not be found.</p>
          <button
            onClick={() => navigate(routes.listUrl)}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Back to Expenses List
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#FCA311]/10 p-3 rounded-full">
            <FiEdit className="h-8 w-8 text-[#FCA311]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#14213D]">Edit Expense</h1>
            <p className="text-gray-600 mt-1">
              Update your expense information
            </p>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border border-[#14213D]/10 shadow-lg">
            <ExpenseForm initialData={expense} isEdit={true} />
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EditExpense;
