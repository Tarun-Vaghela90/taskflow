// components/form/FormInput.jsx
import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  required
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className="mb-1 font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, { required })}
        className={`border rounded px-3 py-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {error && (
        <span className="text-red-500 text-sm mt-1">{error.message}</span>
      )}
    </div>
  );
};

export default FormInput;
