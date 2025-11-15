"use client";

import { FaSearch } from "react-icons/fa";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  showButton?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  showButton = false,
  className = "",
  onChange,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    onSearch?.(searchValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.currentTarget.value);
  };

  return (
    <form
      className={`${styles.searchBar} ${className}`}
      onSubmit={handleSubmit}
    >
      <FaSearch className={styles.searchIcon} />
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        className={styles.searchInput}
        onChange={handleChange}
      />
      {showButton && (
        <button type="submit" className={styles.searchButton}>
          <FaSearch size={14} />
          Search
        </button>
      )}
    </form>
  );
}
