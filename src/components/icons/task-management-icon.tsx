import * as React from 'react';

export function TaskManagementIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="48" cy="48" r="48" fill="#E0E7FF" />
      <rect x="28" y="34" width="40" height="28" rx="4" fill="#A5B4FC" />
      <path
        d="M36 44L42 50L58 38"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
