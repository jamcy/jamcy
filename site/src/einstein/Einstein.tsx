export default function Einstein() {
  return <svg width={1000} height={1000}>
    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
    {/* <polygon points="200,10 250,190 160,210" style="fill:lime;stroke:purple;stroke-width:1" /> */}
    {/* <polyline points="20,20 40,25 60,40 80,120 120,140 200,180" style="fill:none;stroke:black;stroke-width:3" /> */}
    <rect width="10" height="10">
      <animate
        attributeName="rx"
        values="0;5;0"
        dur="10s"
        repeatCount="indefinite" />
    </rect>
  {/* <rect x="50" y="20" rx="20" ry="20" width="150" height="150" style="fill:red;stroke:black;stroke-width:5;opacity:0.5" /> */}
  </svg>
}
