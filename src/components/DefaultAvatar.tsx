import React from 'react';

export const defaultAvatarBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNMTAwIDExMEMxMTEuMDQ2IDExMCAxMjAgMTAxLjA0NiAxMjAgOTBDMTIwIDc4Ljk1NCAxMTEuMDQ2IDcwIDEwMCA3MEM4OC45NTQgNzAgODAgNzguOTU0IDgwIDkwQzgwIDEwMS4wNDYgODguOTU0IDExMCAxMDAgMTEwWk0xMDAgMTIwQzc0LjI4NTcgMTIwIDU0IDExOS4yODUgNTQgMTE4LjU3MUM1NCAxMTcuODU3IDc0LjI4NTcgMTE3IDEwMCAxMTdDMTI1LjcxNCAxMTcgMTQ2IDExNy44NTcgMTQ2IDExOC41NzFDMTQ2IDExOS4yODUgMTI1LjcxNCAxMjAgMTAwIDEyMFoiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=';

interface DefaultAvatarProps {
  size?: number;
  className?: string;
}

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ size = 40, className = '' }) => {
  return (
    <div
      className={`bg-gray-200 rounded-full flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="text-gray-500"
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}; 