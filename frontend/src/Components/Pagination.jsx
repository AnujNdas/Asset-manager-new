import React from "react";
import "../Component_styles/Pagination.css"
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const visibleRange = 1;

  pages.push(
    <button
      key={1}
      className={currentPage === 1 ? "active" : ""}
      onClick={() => onPageChange(1)}
    >
      1
    </button>
  );

  const left = Math.max(2, currentPage - visibleRange);
  const right = Math.min(totalPages - 1, currentPage + visibleRange);

  if (left > 2) pages.push(<span key="leftdots" className="dots">...</span>);

  for (let i = left; i <= right; i++) {
    pages.push(
      <button
        key={i}
        className={currentPage === i ? "active" : ""}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }

  if (right < totalPages - 1) pages.push(<span key="rightdots" className="dots">...</span>);

  pages.push(
    <button
      key={totalPages}
      className={currentPage === totalPages ? "active" : ""}
      onClick={() => onPageChange(totalPages)}
    >
      {totalPages}
    </button>
  );

  return (
    <div className="pagination">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {pages}

      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
