"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  slug: string;
  currentPage: number;
  totalPages: number;
  locale: string;
};

export default function Pagination({ slug, currentPage, totalPages, locale }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Force a hard navigation to bypass Next.js router cache
    window.location.href = url;
  };

  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near start: show 1, 2, 3, 4, ..., last
        pages.push(2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: show 1, ..., last-3, last-2, last-1, last
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-12 mb-8" aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-magenta/10 border border-transparent hover:border-magenta/40 disabled:hover:bg-transparent disabled:hover:border-transparent"
        aria-label={locale === "es" ? "Página anterior" : "Previous page"}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{locale === "es" ? "Anterior" : "Previous"}</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => navigateToPage(page)}
              disabled={page === currentPage}
              className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-semibold transition-all ${
                page === currentPage
                  ? 'bg-magenta text-white border-2 border-magenta shadow-lg shadow-magenta/30 cursor-default'
                  : 'border border-magenta/30 hover:border-magenta hover:bg-magenta/10'
              }`}
              aria-label={`${locale === "es" ? "Página" : "Page"} ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-2 text-text-gray/50">
              {page}
            </span>
          )
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-magenta/10 border border-transparent hover:border-magenta/40 disabled:hover:bg-transparent disabled:hover:border-transparent"
        aria-label={locale === "es" ? "Página siguiente" : "Next page"}
      >
        <span className="hidden sm:inline">{locale === "es" ? "Siguiente" : "Next"}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
