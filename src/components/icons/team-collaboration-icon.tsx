import * as React from 'react';

export function TeamCollaborationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="60" cy="60" r="60" fill="#E8EAF6" />
      <path
        d="M90.5,39.5h-57c-1.1,0-2,.9-2,2v33c0,1.1,.9,2,2,2h57c1.1,0,2-.9,2-2v-33c0-1.1-.9-2-2-2Z"
        fill="#FFFFFF"
        stroke="#4F86F7"
        strokeWidth="2"
      />
      <path d="M76.5,88.5v-10h-29v10" stroke="#4F86F7" strokeWidth="2" strokeLinecap="round" />
      <path d="M70.5,88.5h-17" stroke="#4F86F7" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M48,56.5l8-8,10,10,12-12"
        stroke="#4F86F7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="92.5" cy="45.5" r="5" fill="#4F86F7" />
      <path d="M90.5,45.5h4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34.5" cy="45.5" r="5" fill="#4F86F7" />
      <path d="M32.5,45.5h4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M36.5,45.5v4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <rect x="52" y="52" width="6" height="6" rx="1" fill="#F7B54F" />
      <rect x="63" y="44"  width="6" height="6" rx="1" fill="#4F86F7" />
      <rect x="74" y="55"  width="6" height="6" rx="1" fill="#73A2F7" />
       <path d="M52.5,60.5h-6c-1.1,0-2-.9-2-2v-10" stroke="#4F86F7" strokeWidth="2" strokeLinecap="round" />
      <path d="M69,45.5l-3,3" stroke="#4F86F7" strokeWidth="2" strokeLinecap="round" />

      {/* Person 1 */}
      <path d="M53,96 V89.68 C53,87.09 50.91,85 48.32,85 H40.68 C38.09,85 36,87.09 36,89.68 V96" fill="#D1E3FF" />
      <path d="M39,70 a5,5 0 1 1 6,0" fill="#F7B54F"/>
      <path d="M42,75 c-5,0-5,8,0,8 h-2 c-5,0-5-8,0-8" fill="#F7B54F"/>
      <path d="M47,78 C47,76 45,74 42.5,74 S38,76 38,78" fill="#4F86F7" />
       <path d="M50,85 C50,83 48,81 45.5,81 S41,83 41,85" stroke="#F7B54F" strokeWidth="2" fill="none" />
      
      {/* Person 2 */}
      <path d="M85,96 V89.68 C85,87.09 82.91,85 80.32,85 H72.68 C70.09,85 68,87.09 68,89.68 V96" fill="#D1E3FF" />
       <path d="M71,70 a5,5 0 1 1 6,0" fill="#73A2F7"/>
      <path d="M74,75 c-5,0-5,8,0,8 h-2 c-5,0-5-8,0-8" fill="#73A2F7"/>
       <path d="M79,78 C79,76 77,74 74.5,74 S70,76 70,78" fill="#4F86F7" />
        <path d="M82,85 C82,83 80,81 77.5,81 S73,83 73,85" stroke="#73A2F7" strokeWidth="2" fill="none" />

    </svg>
  );
}
