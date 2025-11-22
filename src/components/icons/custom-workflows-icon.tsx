import * as React from 'react';

export function CustomWorkflowsIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="44" y="32" width="8" height="8" rx="4" fill="#A5B4FC" />
      <path d="M48 40V48" stroke="#A5B4FC" strokeWidth="2" />
      <rect x="32" y="48" width="8" height="8" rx="4" fill="#A5B4FC" />
      <rect x="56" y="48" width="8" height="8" rx="4" fill="#A5B4FC" />
      <path d="M48 48H40" stroke="#A5B4FC" strokeWidth="2" />
      <path d="M48 48H56" stroke="#A5B4FC" strokeWidth="2" />
      <path d="M36 56V64" stroke="#A5B4FC" strokeWidth="2" />
      <rect x="32" y="64" width="8" height="8" rx="4" fill="#A5B4FC" />
    </svg>
  );
}
