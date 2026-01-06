import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderPageNumbers = () => {
    const activePage = Number(currentPage);

    if (totalPages <= 7) {
      return pages.map((page) => (
        <Button
          key={page}
          type="button"
          variant={activePage === page ? 'blue' : 'secondary'}
          onClick={() => onPageChange(page)}
          className="w-8 h-8 p-0"
        >
          {page}
        </Button>
      ));
    }

    const visiblePages = [];
    if (activePage <= 4) {
      for (let i = 1; i <= 5; i++) visiblePages.push(i);
      visiblePages.push('...');
      visiblePages.push(totalPages);
    } else if (activePage >= totalPages - 3) {
      visiblePages.push(1);
      visiblePages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) visiblePages.push(i);
    } else {
      visiblePages.push(1);
      visiblePages.push('...');
      visiblePages.push(activePage - 1);
      visiblePages.push(activePage);
      visiblePages.push(activePage + 1);
      visiblePages.push('...');
      visiblePages.push(totalPages);
    }

    return visiblePages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }
      return (
        <Button
          key={page}
          type="button"
          variant={activePage === page ? 'blue' : 'secondary'}
          onClick={() => onPageChange(page as number)}
          className="w-8 h-8 p-0"
        >
          {page}
        </Button>
      );
    });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      {totalItems !== undefined && (
        <span className="text-sm text-muted-foreground">Total: {totalItems} itens</span>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPageChange(Number(currentPage) - 1)}
          disabled={Number(currentPage) === 1}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {renderPageNumbers()}
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPageChange(Number(currentPage) + 1)}
          disabled={Number(currentPage) === totalPages}
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
