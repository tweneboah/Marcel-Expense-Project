import { useState, useEffect, useRef } from "react";
import { getPlaceSuggestions } from "../../utils/googleMaps";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiSearch, FiLoader } from "react-icons/fi";

const PlaceAutocomplete = ({
  label,
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  required = false,
  disabled = false,
  error = null,
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const results = await getPlaceSuggestions(query);
        setSuggestions(results || []);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange && onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.description);
    onChange && onChange(suggestion.description);
    onPlaceSelect &&
      onPlaceSelect({
        description: suggestion.description,
        placeId: suggestion.placeId,
      });
    setIsFocused(false);
    setSuggestions([]);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[#14213D] mb-2">
        {label} {required && <span className="text-[#FCA311]">*</span>}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiMapPin className="h-5 w-5 text-[#FCA311]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          disabled={disabled}
          className={`block w-full pl-10 pr-10 py-3 border-2 ${
            error
              ? "border-red-500"
              : isFocused
              ? "border-[#FCA311]"
              : "border-gray-300"
          } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          } transition-all duration-200`}
        />

        {/* Right side icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <FiLoader className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <FiSearch className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            ref={suggestionRef}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-base overflow-auto max-h-60 border border-[#14213D]/10"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -5 }}
            variants={containerVariants}
          >
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.placeId}
                className="cursor-pointer px-4 py-3 hover:bg-[#FCA311]/10 flex items-center gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <FiMapPin className="h-4 w-4 text-[#FCA311] flex-shrink-0" />
                <span className="text-[#14213D]">{suggestion.description}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaceAutocomplete;
