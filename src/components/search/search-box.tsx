"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/components/product/price";
import { useDismissibleLayer } from "@/components/ui/overlay-provider";
import { useResetOnNavigation } from "@/hooks/use-reset-on-navigation";
import { navigateToSearch } from "@/lib/client-navigation";

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
  initialQuery?: string;
};

const quickSearches = ["basmati rice", "momo masala", "wai wai", "tea", "ghee"] as const;

function SearchIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.6-4.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

type SearchSuggestionsPanelProps = {
  activeIndex: number;
  isLoading: boolean;
  listboxId: string;
  onSearchAll: () => void;
  onSelectQuickSearch: (value: string) => void;
  onSelectSuggestion: (suggestion: Suggestion) => void;
  panelRef: RefObject<HTMLDivElement | null>;
  panelStyle: CSSProperties;
  query: string;
  setActiveIndex: (index: number) => void;
  suggestions: Suggestion[];
};

function SearchSuggestionsPanel({
  activeIndex,
  isLoading,
  listboxId,
  onSearchAll,
  onSelectQuickSearch,
  onSelectSuggestion,
  panelRef,
  panelStyle,
  query,
  setActiveIndex,
  suggestions,
}: SearchSuggestionsPanelProps) {
  const trimmedQuery = query.trim();
  const showQuickSearches = trimmedQuery.length === 0;
  const showEmptyState = trimmedQuery.length >= 2 && !isLoading && suggestions.length === 0;

  return (
    <div
      className="a1-menu-enter fixed z-[var(--z-layer-popover)] overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-[0_24px_60px_rgba(15,46,26,0.2)]"
      id={listboxId}
      ref={panelRef}
      role={suggestions.length > 0 ? "listbox" : undefined}
      style={panelStyle}
    >
      {showQuickSearches ? (
        <div>
          <p className="px-2 pb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Quick searches</p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((term) => (
              <button
                className="min-h-11 cursor-pointer rounded-full border border-primary/12 bg-fresh-soft/75 px-3 text-sm font-bold text-primary transition-colors hover:border-cta/40 hover:bg-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                key={term}
                onClick={() => onSelectQuickSearch(term)}
                type="button"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="px-3 py-4 text-sm font-semibold text-text-muted" role="status">
          Searching groceries...
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div>
          {suggestions.map((suggestion, index) => (
              <button
                aria-selected={index === activeIndex}
                className={[
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                  index === activeIndex ? "bg-fresh-soft" : "hover:bg-surface-muted",
                ].join(" ")}
                id={`${listboxId}-option-${suggestion.id}`}
                key={suggestion.id}
                onClick={() => onSelectSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                type="button"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                  {suggestion.imageUrl ? (
                    <Image alt="" className="h-full w-full object-cover" fill sizes="44px" src={suggestion.imageUrl} />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-text">{suggestion.name}</span>
                  <span className="block truncate text-xs font-semibold text-text-muted">{suggestion.categoryName}</span>
                </span>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-primary">
                  {formatCurrency(suggestion.startingPrice, suggestion.currency)}
                </span>
              </button>
          ))}
        </div>
      ) : null}

      {showEmptyState ? (
        <div className="rounded-xl bg-surface-muted/60 px-3 py-4">
          <p className="text-sm font-bold text-text">No quick matches found.</p>
          <p className="mt-1 text-xs font-semibold text-text-muted">Search all groceries for more results.</p>
          <button
            className="mt-3 min-h-11 cursor-pointer rounded-full bg-primary px-4 text-sm font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={onSearchAll}
            type="button"
          >
            Search all groceries
          </button>
        </div>
      ) : null}

      {trimmedQuery.length >= 2 && suggestions.length > 0 ? (
        <button
          className="mt-1 w-full cursor-pointer rounded-xl border-t border-border px-3 py-2.5 text-left text-sm font-bold text-cta-hover transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          onClick={onSearchAll}
          type="button"
        >
          See all results for &quot;{trimmedQuery}&quot;
        </button>
      ) : null}
    </div>
  );
}

export function SearchBox({
  variant = "header",
  placeholder = "Search rice, masala, noodles, tea",
  initialQuery = "",
}: SearchBoxProps) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLFormElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isHero = variant === "hero";

  const dismiss = useDismissibleLayer({
    contentRef: panelRef,
    dismissOnResize: false,
    dismissOnScroll: false,
    onDismiss: () => {
      setIsOpen(false);
      setActiveIndex(-1);
    },
    open: isOpen,
    restoreFocusOnDismiss: true,
    triggerRef: containerRef,
  });

  const resetTransientSearch = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    abortRef.current?.abort();
    abortRef.current = null;
    setQuery(initialQuery);
    setSuggestions([]);
    setIsOpen(false);
    setIsLoading(false);
    setActiveIndex(-1);
  }, [initialQuery]);

  useResetOnNavigation(resetTransientSearch);

  const updatePanelPosition = useCallback(() => {
    const container = containerRef.current;

    if (!container || typeof window === "undefined") {
      return;
    }

    const rect = container.getBoundingClientRect();
    const visualViewport = window.visualViewport;
    const viewportPadding = window.innerWidth < 768 ? 8 : 12;
    const viewportTop = visualViewport?.offsetTop ?? 0;
    const viewportHeight = visualViewport?.height ?? window.innerHeight;
    const viewportWidth = visualViewport?.width ?? window.innerWidth;
    const top = Math.max(rect.bottom + (window.innerWidth < 768 ? 6 : 8), viewportTop + viewportPadding);
    const width = window.innerWidth < 768
      ? Math.max(0, viewportWidth - viewportPadding * 2)
      : Math.min(rect.width, viewportWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      Math.max(viewportPadding, viewportWidth - width - viewportPadding),
    );
    const availableHeight = Math.max(0, viewportTop + viewportHeight - top - viewportPadding);
    const maxHeight = window.innerWidth < 768 ? availableHeight : Math.min(320, availableHeight);

    setPanelStyle({
      left,
      maxHeight,
      top,
      width,
    });
  }, []);

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

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    window.visualViewport?.addEventListener("resize", updatePanelPosition);
    window.visualViewport?.addEventListener("scroll", updatePanelPosition);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.visualViewport?.removeEventListener("resize", updatePanelPosition);
      window.visualViewport?.removeEventListener("scroll", updatePanelPosition);
    };
  }, [isOpen, isLoading, query, suggestions.length, updatePanelPosition]);

  function fetchSuggestions(value: string) {
    abortRef.current?.abort();

    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setIsOpen(true);

    fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { suggestions?: Suggestion[] } | null) => {
        if (!controller.signal.aborted) {
          setSuggestions(data?.suggestions ?? []);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
  }

  function handleChange(value: string) {
    setQuery(value);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (value.trim().length === 0) {
      abortRef.current?.abort();
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    debounceRef.current = window.setTimeout(() => fetchSuggestions(value), 220);
  }

  function goToProduct(suggestion: Suggestion) {
    dismiss("navigation");
    router.push(`/products/${suggestion.slug}`, { scroll: true });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      dismiss("escape");
      return;
    }

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
    }
  }

  function clearSearch() {
    abortRef.current?.abort();
    setQuery("");
    setSuggestions([]);
    setIsLoading(false);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function searchAll(value = query.trim()) {
    dismiss("navigation");
    navigateToSearch(value, router);
  }

  function selectQuickSearch(value: string) {
    setQuery(value);
    fetchSuggestions(value);
  }

  return (
    <form
      action="/search#product-results"
      className="relative z-30 min-w-0 focus-within:z-[var(--z-layer-popover)]"
      onSubmit={(event) => {
        event.preventDefault();
        searchAll();
      }}
      ref={containerRef}
      role="search"
    >
      <label className="sr-only" htmlFor={`${listboxId}-input`}>
        Search groceries
      </label>
      <div
        className={[
          "flex items-center rounded-full border border-border bg-surface shadow-sm transition-[border-color,box-shadow] focus-within:border-cta focus-within:shadow-[0_0_0_3px_rgba(198,146,46,0.16)]",
          isHero ? "min-h-[3.25rem] gap-1.5 pl-4 pr-1.5 sm:min-h-14 sm:gap-2 sm:pl-5 sm:pr-2" : "min-h-12 gap-1.5 pl-4 pr-0.5 md:min-h-11 md:gap-2 md:pr-1.5",
        ].join(" ")}
      >
        <SearchIcon className={isHero ? "h-5 w-5 shrink-0 text-text-muted" : "h-4 w-4 shrink-0 text-text-muted"} />
        <input
          aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-option-${suggestions[activeIndex]?.id}` : undefined}
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          autoComplete="off"
          className={[
            "min-h-11 min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted",
            isHero ? "text-base" : "text-base md:text-sm",
          ].join(" ")}
          id={`${listboxId}-input`}
          name="q"
          onClick={() => {
            if (query.trim().length === 0) {
              setIsOpen(true);
            }
          }}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (query.trim().length === 0 || suggestions.length > 0 || isLoading) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-text-muted transition-colors hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:h-9 md:w-9"
            onClick={clearSearch}
            type="button"
          >
            <CloseIcon />
          </button>
        ) : null}
        <button
          aria-label="Search"
          className={[
            "a1-primary-button shrink-0 cursor-pointer rounded-full",
            isHero ? "h-11 w-11 !min-h-0 px-0 text-sm sm:w-auto sm:px-6" : "h-11 w-11 !min-h-0 px-0 md:h-9 md:w-9",
          ].join(" ")}
          type="submit"
        >
          {isHero ? (
            <>
              <span className="sr-only sm:not-sr-only">Search</span>
              <SearchIcon className="h-4 w-4 sm:hidden" />
            </>
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <SearchSuggestionsPanel
              activeIndex={activeIndex}
              isLoading={isLoading}
              listboxId={listboxId}
              onSearchAll={() => searchAll()}
              onSelectQuickSearch={selectQuickSearch}
              onSelectSuggestion={goToProduct}
              panelRef={panelRef}
              panelStyle={panelStyle}
              query={query}
              setActiveIndex={setActiveIndex}
              suggestions={suggestions}
            />,
            document.body,
          )
        : null}
    </form>
  );
}
