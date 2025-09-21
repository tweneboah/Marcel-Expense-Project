import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiUserCheck,
  FiUserX,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiMail,
  FiLock,
  FiCheckCircle,
  FiShield,
  FiUser,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/userApi";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales_rep",
    status: "active",
  });
  const [passwordError, setPasswordError] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      toast.error("Failed to load users");
      // Error handled by error context
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // In a real API, you would send the new status
      // Default to "inactive" if status is undefined
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await updateUser(userId, { status: newStatus });

      // Update local state
      setUsers(
        users.map((user) => {
          if (user._id === userId) {
            return {
              ...user,
              status: newStatus,
            };
          }
          return user;
        })
      );

      toast.success(
        `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to update user status");
      // Error handled by error context
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Password validation for add user form
    if (name === "password" && showAddUserModal) {
      if (value.length > 0 && value.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
      } else {
        setPasswordError("");
      }
    }
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Client-side password validation
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      const response = await createUser(formData);
      setUsers([...users, response.data]);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "sales_rep",
        status: "active",
      });
      setPasswordError("");
      setShowAddUserModal(false);
      toast.success("User added successfully");
    } catch (err) {
      toast.error(err.message || "Failed to add user");
      // Error handled by error context
    }
  };

  // Handle edit user form submission
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      // Don't send password if it's empty (unchanged)
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      const response = await updateUser(selectedUser._id, updateData);

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      );

      setShowEditModal(false);
      toast.success("User updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update user");
      // Error handled by error context
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser._id);

      // Update local state
      setUsers(users.filter((user) => user._id !== selectedUser._id));

      setShowDeleteModal(false);
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
      // Error handled by error context
    }
  };

  // Prepare for editing a user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't prefill password for security reasons
      role: user.role,
      status: user.status || "inactive", // Set default status if undefined
    });
    setShowEditModal(true);
  };

  // Prepare for deleting a user
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-6xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FiUsers className="text-[#f7b801] mr-3 text-2xl" />
        <h1 className="text-3xl font-bold text-[#3d348b]">User Management</h1>
      </motion.div>

      <motion.p
        className="text-gray-600 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Add, edit, and manage user accounts and permissions
      </motion.p>

      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        variants={itemVariants}
      >
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch className="w-5 h-5" />
          </div>
        </div>

        <motion.button
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              password: "",
              role: "sales_rep",
              status: "active",
            });
            setPasswordError("");
            setShowAddUserModal(true);
          }}
          className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white px-4 py-2 rounded-lg hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7678ed] transition-all duration-300 flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiUserPlus className="mr-2" />
          Add New User
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7678ed]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <FiAlertTriangle className="mr-2" />
          {error}
        </div>
      ) : (
        <motion.div
          className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiMail className="mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiShield
                            className={`mr-2 ${
                              user.role === "admin"
                                ? "text-[#f35b04]"
                                : "text-[#7678ed]"
                            }`}
                          />
                          {user.role === "admin"
                            ? "Administrator"
                            : "Sales Representative"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "active" ? (
                            <FiCheckCircle className="mr-1" />
                          ) : (
                            <FiAlertTriangle className="mr-1" />
                          )}
                          {user.status
                            ? user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <motion.button
                            onClick={() =>
                              toggleUserStatus(user._id, user.status)
                            }
                            className={`flex items-center px-2 py-1 rounded ${
                              user.status === "active"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {user.status === "active" ? (
                              <>
                                <FiUserX className="mr-1" />
                                <span className="hidden sm:inline">
                                  Deactivate
                                </span>
                              </>
                            ) : (
                              <>
                                <FiUserCheck className="mr-1" />
                                <span className="hidden sm:inline">
                                  Activate
                                </span>
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            onClick={() => handleEditClick(user)}
                            className="flex items-center px-2 py-1 rounded text-[#7678ed] hover:bg-blue-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiEdit2 className="mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteClick(user)}
                            className="flex items-center px-2 py-1 rounded text-red-500 hover:bg-red-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTrash2 className="mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#3d348b] flex items-center">
                  <FiUserPlus className="text-[#f7b801] mr-2" />
                  Add New User
                </h3>
                <motion.button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
              </div>

              <form className="space-y-4" onSubmit={handleAddUser}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUser className="mr-2 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMail className="mr-2 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-gray-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Create password (min 6 characters)"
                    minLength={6}
                    required
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FiAlertTriangle className="mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiShield className="mr-2 text-gray-400" />
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                  >
                    <option value="sales_rep">Sales Representative</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUserCheck className="mr-2 text-gray-400" />
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={passwordError || formData.password.length < 6}
                    className={`px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-300 flex items-center ${
                      passwordError || formData.password.length < 6
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#3d348b] to-[#7678ed] hover:shadow-md'
                    }`}
                    whileHover={passwordError || formData.password.length < 6 ? {} : { scale: 1.02 }}
                    whileTap={passwordError || formData.password.length < 6 ? {} : { scale: 0.98 }}
                  >
                    <FiSave className="mr-2" />
                    Add User
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#3d348b] flex items-center">
                  <FiEdit2 className="text-[#f7b801] mr-2" />
                  Edit User
                </h3>
                <motion.button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
              </div>

              <form className="space-y-4" onSubmit={handleEditUser}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUser className="mr-2 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMail className="mr-2 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-gray-400" />
                    Password (leave blank to keep unchanged)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiShield className="mr-2 text-gray-400" />
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                  >
                    <option value="sales_rep">Sales Representative</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUserCheck className="mr-2 text-gray-400" />
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-[#7678ed] focus:border-[#7678ed] transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#3d348b] to-[#7678ed] hover:shadow-md transition-all duration-300 flex items-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center mb-4 text-red-500">
                <FiAlertTriangle className="text-2xl mr-2" />
                <h3 className="text-xl font-bold">Delete User</h3>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedUser?.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiX className="mr-2" />
                  Cancel
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiTrash2 className="mr-2" />
                  Delete User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserManagement;
