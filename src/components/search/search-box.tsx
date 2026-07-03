"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { formatCurrency } from "@/components/product/price";

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  imageUrl: string | null;
  startingPrice: number;
  currency: string;
  isInStock: boolean;
};

type SearchBoxProps = {
  variant?: "header" | "hero";
  placeholder?: string;
};

function SearchIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.6-4.6" />
    </svg>
  );
}

export function SearchBox({ variant = "header", placeholder = "Search rice, masala, noodles, tea" }: SearchBoxProps) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLFormElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isHero = variant === "hero";

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function fetchSuggestions(value: string) {
    abortRef.current?.abort();

    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { suggestions?: Suggestion[] } | null) => {
        if (data?.suggestions) {
          setSuggestions(data.suggestions);
          setIsOpen(true);
          setActiveIndex(-1);
        }
      })
      .catch(() => null);
  }

  function handleChange(value: string) {
    setQuery(value);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => fetchSuggestions(value), 220);
  }

  function goToProduct(suggestion: Suggestion) {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/products/${suggestion.slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      goToProduct(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <form
      action="/search"
      className="relative min-w-0"
      onSubmit={() => {
        setIsOpen(false);
        setActiveIndex(-1);
      }}
      ref={containerRef}
      role="search"
    >
      <label className="sr-only" htmlFor={`${listboxId}-input`}>
        Search groceries
      </label>
      <div
        className={[
          "flex items-center gap-2 rounded-full border border-border bg-surface shadow-sm transition-[border-color,box-shadow] focus-within:border-cta focus-within:shadow-[0_0_0_3px_rgba(198,146,46,0.16)]",
          isHero ? "min-h-14 pl-5 pr-2" : "min-h-11 pl-4 pr-1.5",
        ].join(" ")}
      >
        <SearchIcon className={isHero ? "h-5 w-5 shrink-0 text-text-muted" : "h-4 w-4 shrink-0 text-text-muted"} />
        <input
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          autoComplete="off"
          className={[
            "min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted",
            isHero ? "text-base" : "text-sm",
          ].join(" ")}
          id={`${listboxId}-input`}
          name="q"
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 && query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          type="search"
          value={query}
        />
        <button
          aria-label="Search"
          className={[
            "a1-primary-button shrink-0 cursor-pointer rounded-full",
            isHero ? "min-h-11 px-6 text-sm" : "h-9 w-9 !min-h-0 px-0",
          ].join(" ")}
          type="submit"
        >
          {isHero ? "Search" : <SearchIcon className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && suggestions.length > 0 ? (
        <ul
          className="a1-menu-enter absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-[0_24px_60px_rgba(15,46,26,0.16)]"
          id={listboxId}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
              <button
                className={[
                  "flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                  index === activeIndex ? "bg-fresh-soft" : "hover:bg-surface-muted",
                ].join(" ")}
                onClick={() => goToProduct(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                type="button"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                  {suggestion.imageUrl ? (
                    <Image alt="" className="h-full w-full object-cover" fill sizes="44px" src={suggestion.imageUrl} unoptimized />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-text">{suggestion.name}</span>
                  <span className="block text-xs font-semibold text-text-muted">{suggestion.categoryName}</span>
                </span>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-primary">
                  {formatCurrency(suggestion.startingPrice, suggestion.currency)}
                </span>
              </button>
            </li>
          ))}
          <li className="border-t border-border">
            <button
              className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm font-bold text-cta-hover transition-colors hover:bg-surface-muted"
              onClick={() => {
                setIsOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              type="button"
            >
              See all results for &quot;{query.trim()}&quot;
            </button>
          </li>
        </ul>
      ) : null}
    </form>
  );
}
