import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  showPageSizeSelector?: boolean;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showPageSizeSelector = true,
}) => {
  const pageSizeOptions = [
    { label: '5 per page', value: 5 },
    { label: '10 per page', value: 10 },
    { label: '20 per page', value: 20 },
    { label: '50 per page', value: 50 },
  ];

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='flex flex-column md:flex-row align-items-center justify-content-between gap-3 p-3 border-top-1 surface-border'>
      <div className='flex align-items-center gap-2 text-sm text-600'>
        <span>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
        </span>
      </div>

      <div className='flex align-items-center gap-2'>
        {showPageSizeSelector && onPageSizeChange && (
          <Dropdown
            value={pageSize}
            options={pageSizeOptions}
            onChange={(e: { value: number }) => onPageSizeChange(e.value)}
            className='w-8rem'
            disabled={loading}
          />
        )}

        <div className='flex align-items-center gap-1'>
          <Button
            icon='pi pi-angle-double-left'
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || loading}
            className='p-button-text p-button-plain p-button-sm'
            tooltip='First page'
          />
          <Button
            icon='pi pi-angle-left'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className='p-button-text p-button-plain p-button-sm'
            tooltip='Previous page'
          />

          {getVisiblePages().map(page => (
            <span
              key={
                typeof page === 'string' ? `dots-${Math.random()}` : `page-${page}`
              }
            >
              {page === '...' ? (
                <span className='px-2 py-1 text-500'>...</span>
              ) : (
                <Button
                  label={page.toString()}
                  onClick={() => onPageChange(page as number)}
                  className={`p-button-sm ${
                    currentPage === page
                      ? 'p-button-primary'
                      : 'p-button-text p-button-plain'
                  }`}
                  disabled={loading}
                />
              )}
            </span>
          ))}

          <Button
            icon='pi pi-angle-right'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className='p-button-text p-button-plain p-button-sm'
            tooltip='Next page'
          />
          <Button
            icon='pi pi-angle-double-right'
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || loading}
            className='p-button-text p-button-plain p-button-sm'
            tooltip='Last page'
          />
        </div>
      </div>
    </div>
  );
};
