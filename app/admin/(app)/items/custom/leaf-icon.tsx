// Small green leaf marking a sugar-free syrup, at a glance.
export function LeafIcon({ title = "Sugar-free" }: { title?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      role="img"
      aria-label={title}
      style={{ flex: "0 0 auto" }}
    >
      <title>{title}</title>
      <path
        d="M13 3c0 5.5-3 8.5-7.5 8.5C4 11.5 3 10 3 8.5 3 5 6 3 13 3Z"
        fill="var(--leaf, #6fbf73)"
        stroke="var(--pine, #2f7d43)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M5 11.5C6.5 9 8.5 7.5 11 6.5"
        stroke="var(--pine, #2f7d43)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
