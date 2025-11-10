export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  // Simple logo that follows currentColor so we can recolor via CSS
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Outer hexagon */}
      <path
        d="M12 2l7 4v8l-7 4-7-4V6l7-4z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Inner diamond */}
      <path
        d="M12 6l3 3-3 3-3-3 3-3z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
