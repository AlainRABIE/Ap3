import React from "react";

interface SelectProps {
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md"
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
