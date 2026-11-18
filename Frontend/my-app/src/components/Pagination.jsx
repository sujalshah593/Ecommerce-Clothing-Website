import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pageSize, total, onPageChange, label = "items" }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return <div className="admin-pagination" aria-label={`${label} pagination`}><span>Showing {firstItem}-{lastItem} of {total} {label}</span><div className="admin-pagination-controls"><button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={15} /></button>{pages.map((pageNumber) => <button type="button" key={pageNumber} onClick={() => onPageChange(pageNumber)} className={pageNumber === page ? "active" : ""} aria-current={pageNumber === page ? "page" : undefined}>{pageNumber}</button>)}<button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page"><ChevronRight size={15} /></button></div></div>;
};

export default Pagination;
