import { Input } from "@/components/ui/input";
import React from "react";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string | number;
  placeholder?: string;
  onChange: (val: string) => void;
  error?: string;
}

export function FormField({ 
  label, 
  type = "text", 
  value, 
  placeholder, 
  onChange,
  error,

}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Input
        className={`text-gray-600 border-b border-gray-300 font-normal ${error ? "border-red-500" : "border-gray-300"}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
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