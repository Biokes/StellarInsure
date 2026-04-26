"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  defaultPage?: number;
  pageParam?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  totalItems,
  itemsPerPage = 10,
  defaultPage = 1,
  pageParam = "page",
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = useMemo(() => {
    const page = searchParams.get(pageParam);
    const parsed = page ? parseInt(page, 10) : defaultPage;
    return isNaN(parsed) || parsed < 1 ? defaultPage : parsed;
  }, [searchParams, pageParam, defaultPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set(pageParam, page.toString());

      const url = `?${params.toString()}`;
      router.push(url, { scroll: false });
      onPageChange?.(page);
    },
    [searchParams, pageParam, currentPage, totalPages, router, onPageChange],
  );

  const handlePrevious = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const handlePageClick = useCallback(
    (page: number) => {
      goToPage(page);
    },
    [goToPage],
  );

  const renderPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === "ellipsis") {
        return (
          <span key={`ellipsis-${index}`} className="pagination__ellipsis">
            …
          </span>
        );
      }

      const isActive = page === currentPage;
      return (
        <button
          key={page}
          className={`pagination__page ${isActive ? "pagination__page--active" : ""}`}
          onClick={() => handlePageClick(page)}
          aria-current={isActive ? "page" : undefined}
          aria-label={`Page ${page}`}
        >
          {page}
        </button>
      );
    });
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__nav pagination__nav--prev"
        onClick={handlePrevious}
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        Previous
      </button>
      <div className="pagination__pages">{renderPageNumbers()}</div>
      <button
        className="pagination__nav pagination__nav--next"
        onClick={handleNext}
        disabled={!hasNext}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}