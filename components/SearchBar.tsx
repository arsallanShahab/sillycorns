"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";

interface SearchResult {
  id: string;
  title: string;
  image: string;
  product_url: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        searchPosts(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchPosts = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setIsOpen(data.length > 0);
        setHighlightedIndex(-1);
      }
    } catch {
      console.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // Open product URL in new tab
    if (result.product_url) {
      window.open(result.product_url, "_blank");
    }
    // Clear search
    setQuery("");
    setIsOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectResult(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="w-full relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search gadgets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="w-full pl-12 pr-10 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Loading state */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin">⏳</div>
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelectResult(result)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                      highlightedIndex === index
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {/* Thumbnail */}
                    {result.image && (
                      <div className="relative w-12 h-12 rounded shrink-0 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <span className="text-gray-400 shrink-0">→</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Empty state */}
          {!isLoading && results.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && results.length === 0 && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 dark:text-gray-400">
          No products found matching &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
