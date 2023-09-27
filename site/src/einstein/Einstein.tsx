export default function Einstein() {
  return <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="10" stroke="green" stroke-width="4" fill="green">
      <animate attributeName="r" values="10;30;10" dur="10s" repeatCount="indefinite" />
    </circle>
    <rect
      fill="none"
      stroke="purple"
      width="100"
      height="100" />
  </svg>
}
