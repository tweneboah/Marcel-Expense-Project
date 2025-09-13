import { Link, useLocation } from "react-router-dom";
import { BASE_URL } from "../../api/apiConfig";
import {
  FaFileAlt,
  FaChartBar,
  FaChartLine,
  FaChartArea,
  FaChartPie,
  FaFilter,
  FaCalendarAlt,
  FaWallet,
  FaMoneyBillWave,
  FaProjectDiagram,
} from "react-icons/fa";

const ReportsNav = () => {
  const location = useLocation();
  const isReportsOverview = location.pathname === "/admin/reports";

  const reports = [
    {
      id: "ytd",
      label: "YTD Reports",
      path: "/admin/reports/ytd",
      icon: <FaFileAlt className="mr-2 text-green-500" size={18} />,
      
    },
    {
      id: "chart-data",
      label: "Chart Data",
      path: "/admin/reports/chart-data",
      icon: <FaChartPie className="mr-2 text-blue-500" size={18} />,

    },
    {
      id: "forecast",
      label: "Expense Forecasting",
      path: "/admin/reports/expense-forecasting",
      icon: <FaChartLine className="mr-2 text-indigo-500" size={18} />,
      
    },
    {
      id: "advanced-forecast",
      label: "Advanced Forecast",
      path: "/admin/reports/forecast",
      icon: <FaChartArea className="mr-2 text-teal-500" size={18} />,
    
    },
    {
      id: "budget-comparison",
      label: "Budget Comparison",
      path: "/admin/reports/budget-comparison",
      icon: <FaChartBar className="mr-2 text-yellow-500" size={18} />,
     
    },
    {
      id: "filtered-expenses",
      label: "Filtered Expenses",
      path: "/admin/reports/filtered-expenses",
      icon: <FaFilter className="mr-2 text-purple-500" size={18} />,
    
    },
    {
      id: "budget-summary",
      label: "Budget Summary",
      path: "/admin/reports/budget-summary",
      icon: <FaWallet className="mr-2 text-orange-500" size={18} />,
     
    },
    {
      id: "all-budgets",
      label: "All Budgets",
      path: "/admin/reports/all-budgets",
      icon: <FaMoneyBillWave className="mr-2 text-red-500" size={18} />,
      
    },
    {
      id: "budget-details",
      label: "Budget Details",
      path: "/admin/reports/budget-details",
      icon: <FaProjectDiagram className="mr-2 text-cyan-500" size={18} />,
     
    },
    {
      id: "expense-trends",
      label: "Expense Trends",
      path: "/admin/reports/expense-trends",
      icon: <FaChartLine className="mr-2 text-teal-500" size={18} />,
     
    },
    {
      id: "yearly-comparison",
      label: "Yearly Comparison",
      path: "/admin/reports/yearly-comparison",
      icon: <FaChartArea className="mr-2 text-pink-500" size={18} />,
    
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {reports.map((report) => (
        <Link
          key={report.id}
          to={report.path}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="p-3 rounded-full bg-gray-100 mb-3">{report.icon}</div>
          <span className="font-medium">{report.label}</span>
          <span className="text-xs text-gray-500 mt-1">
          View Reports
          </span>
        </Link>
      ))}
    </div>
  );
};

export default ReportsNav;
