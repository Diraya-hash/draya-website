/** Direction-aware arrow: points forward in both LTR and RTL via CSS flip. */
export default function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`${className} rtl:-scale-x-100`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
