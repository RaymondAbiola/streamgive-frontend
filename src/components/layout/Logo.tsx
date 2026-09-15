/**
 * The StreamGive mark: three donors' streams merging into one channel that
 * ends at the recipient.
 *
 * Drawn in `currentColor` rather than the brand teal, so it takes the colour
 * of whatever text it sits beside and stays legible if the surrounding UI
 * ever inverts. The viewBox is cropped to the artwork, not padded to a
 * square, so it optically aligns with adjacent text instead of floating in
 * its own box.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="8 14 85 72"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <g strokeWidth="9.5" strokeLinecap="round">
        <path d="M13 19 C37 19 38 50 54 50" />
        <path d="M13 50 L54 50" />
        <path d="M13 81 C37 81 38 50 54 50" />
      </g>
      <circle cx="79" cy="50" r="13.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
