"use client";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  showButton?: boolean;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  showButton = false,
  className = "",
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    onSearch?.(searchValue);
  };

  return (
    <form
      className={`${styles.searchBar} ${className}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {showButton && (
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      )}
    </form>
  );
}
