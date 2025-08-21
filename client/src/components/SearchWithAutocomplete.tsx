import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
    id: string | number;
    title: string;
    subtitle?: string;
    category?: string;
}

interface SearchWithAutocompleteProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    onSelect?: (result: SearchResult) => void;
    fetchSuggestions?: (query: string) => Promise<SearchResult[]>;
    className?: string;
    showHistory?: boolean;
}

export function SearchWithAutocomplete({
    placeholder = "Search...",
    onSearch,
    onSelect,
    fetchSuggestions,
    className,
    showHistory = true,
}: SearchWithAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load search history from localStorage
    useEffect(() => {
        if (showHistory) {
            const savedHistory = localStorage.getItem("search-history");
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        }
    }, [showHistory]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 0 && fetchSuggestions) {
                setIsLoading(true);
                try {
                    const results = await fetchSuggestions(query);
                    setSuggestions(results);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Failed to fetch suggestions:", error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (query.length === 0) {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, fetchSuggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (searchQuery: string) => {
        onSearch(searchQuery);

        // Save to history
        if (showHistory && searchQuery.trim()) {
            const newHistory = [
                searchQuery,
                ...history.filter((h) => h !== searchQuery),
            ].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem("search-history", JSON.stringify(newHistory));
        }

        setIsOpen(false);
    };

    const handleSelect = (result: SearchResult) => {
        setQuery(result.title);
        onSelect?.(result);
        handleSearch(result.title);
    };

    const handleHistoryClick = (historyItem: string) => {
        setQuery(historyItem);
        handleSearch(historyItem);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("search-history");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        const items = suggestions.length > 0 ? suggestions : history;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < items.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSelect(suggestions[selectedIndex]);
                } else if (selectedIndex >= 0 && history[selectedIndex]) {
                    handleHistoryClick(history[selectedIndex]);
                } else {
                    handleSearch(query);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    className="pl-10 pr-4"
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-80 overflow-y-auto"
                >
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="py-2">
                            <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                                Suggestions
                            </div>
                            {suggestions.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={cn(
                                        "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                                        selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
                                    )}
                                >
                                    <div className="font-medium text-sm">{result.title}</div>
                                    {result.subtitle && (
                                        <div className="text-xs text-muted-foreground">
                                            {result.subtitle}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : showHistory && history.length > 0 && query.length === 0 ? (
                        <div className="py-2">
                            <div className="px-3 py-1 flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Recent Searches
                                </span>
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear
                                </button>
                            </div>
                            {history.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleHistoryClick(item)}
                                    className={cn(
                                        "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2",
                                        selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
                                    )}
                                >
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{item}</span>
                                </button>
                            ))}
                        </div>
                    ) : query.length > 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No results found
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
