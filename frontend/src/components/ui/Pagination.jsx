import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.page - Current page number
 * @param {number} props.pages - Total number of pages
 * @param {Function} props.onPageChange - Callback function when page changes
 * @param {number} props.siblingCount - Number of sibling page buttons to show (default: 1)
 * @param {string} props.className - Additional CSS classes
 */
export default function Pagination({ 
  page, 
  pages, 
  onPageChange,
  siblingCount = 1,
  className = ''
}) {
  // Don't render if there's only 0 or 1 page
  if (!pages || pages <= 1) return null

  const getPageNumbers = () => {
    const numbers = []
    const showPages = siblingCount * 2 + 3 // +3 for first, last, and ellipsis
    
    if (pages <= showPages) {
      for (let i = 1; i <= pages; i++) {
        numbers.push(i)
      }
    } else {
      if (page <= siblingCount + 2) {
        for (let i = 1; i <= siblingCount + 2; i++) numbers.push(i)
        numbers.push('...')
        numbers.push(pages)
      } else if (page >= pages - siblingCount - 1) {
        numbers.push(1)
        numbers.push('...')
        for (let i = pages - siblingCount - 1; i <= pages; i++) numbers.push(i)
      } else {
        numbers.push(1)
        numbers.push('...')
        for (let i = page - siblingCount; i <= page + siblingCount; i++) numbers.push(i)
        numbers.push('...')
        numbers.push(pages)
      }
    }
    
    return numbers
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-slate-400">
        Page {page} of {pages}
      </div>
      
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>
        
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {/* Page Numbers */}
        {getPageNumbers().map((num, idx) => (
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">...</span>
          ) : (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`min-w-[36px] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                page === num
                  ? 'border-primary bg-primary text-dark'
                  : 'border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {num}
            </button>
          )
        ))}
        
        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
        
        {/* Last */}
        <button
          type="button"
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}
