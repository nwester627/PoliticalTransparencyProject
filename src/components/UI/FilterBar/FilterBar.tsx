"use client";

import { FaFilter } from "react-icons/fa";
import styles from "./FilterBar.module.css";

export interface FilterOption {
  label: string;
  value: string;
}

export interface Filter {
  name: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: Filter[];
  onChange?: (filterName: string, value: string) => void;
  className?: string;
  values?: { [key: string]: string };
}

export default function FilterBar({
  filters,
  onChange,
  className = "",
  values = {},
}: FilterBarProps) {
  const handleChange = (
    filterName: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onChange?.(filterName, e.target.value);
  };

  return (
    <div className={`${styles.filterBar} ${className}`}>
      <div className={styles.filterLabel}>
        <FaFilter />
        <span>Filter by:</span>
      </div>
      {filters.map((filter) => (
        <select
          key={filter.name}
          className={styles.filterSelect}
          onChange={(e) => handleChange(filter.name, e)}
          value={values[filter.name] ?? filter.options[0]?.value}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
