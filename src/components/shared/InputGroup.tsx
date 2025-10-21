import React from "react";

type InputGroupProps = {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
};

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  icon,
  error,
  disabled = false,
}) => {
  return (
    <div className="w-full mb-3">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm ${
            icon ? "pl-9" : ""
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          ${error ? "border-red-500" : "border-gray-300"}`}
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default InputGroup;