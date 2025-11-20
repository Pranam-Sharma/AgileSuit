import Link from 'next/link';

export function BluebackLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-white">
      <div className="bg-white text-blue-600 p-2 rounded-md flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
        <span className="font-extrabold text-2xl">B</span>
      </div>
      <span className="text-xl font-bold tracking-wider">BLUEBACK</span>
    </Link>
  );
}
