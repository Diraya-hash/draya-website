const paths: Record<string, React.ReactNode> = {
  "learning-development": (
    // Open book
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.25c-1.8-1.5-4.4-2-7.25-2v13.5c2.85 0 5.45.5 7.25 2 1.8-1.5 4.4-2 7.25-2V4.25c-2.85 0-5.45.5-7.25 2zm0 0v13.5"
    />
  ),
  "talent-management": (
    // People group
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.75a7.5 7.5 0 0115 0M18.5 6.5a2.75 2.75 0 11-1.2 5.22M20.75 19.75a5.5 5.5 0 00-3-4.9"
    />
  ),
  "leadership-development": (
    // Flag on summit
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.5V4m0 0h7l-2 3 2 3h-7M5 20.5l4.5-7M19 20.5l-4.5-7"
    />
  ),
  "career-development": (
    // Upward path with steps
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20h4v-4h4v-4h4V8h4M16 4h4v4"
    />
  ),
  "learning-needs-analysis": (
    // Magnifier over chart
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zm0 0L20.5 21M7.5 12.5l2-2.5 1.5 1.5 2.5-3.5"
    />
  ),
};

export default function ServiceIcon({
  slug,
  className = "h-8 w-8",
}: {
  slug: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      {paths[slug] ?? paths["learning-development"]}
    </svg>
  );
}
