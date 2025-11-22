import * as React from 'react';

export function TeamCollaborationIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="40" cy="42" r="8" fill="#A5B4FC" />
      <path
        d="M52 58C52 53.5817 48.4183 50 44 50H36C31.5817 50 28 53.5817 28 58V60H52V58Z"
        fill="#A5B4FC"
      />
      <circle cx="56" cy="42" r="8" fill="#A5B4FC" opacity="0.7" />
      <path
        d="M68 58C68 53.5817 64.4183 50 60 50H52C47.5817 50 44 53.5817 44 58V60H68V58Z"
        fill="#A5B4FC"
        opacity="0.7"
      />
    </svg>
  );
}
