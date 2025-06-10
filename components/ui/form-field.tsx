import { Input } from "@/components/ui/input";
import React from "react";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string | number | undefined;
  placeholder?: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function FormField({ 
  label, 
  type = "text", 
  value, 
  placeholder, 
  onChange,
  error,
  disabled = false,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Input
        className={`w-full text-gray-800 border-gray-300 font-normal
          ${error ? "border-red-500" : "focus:border-blue-500"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`
        }
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}