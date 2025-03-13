"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function CatchAllRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const newPath = pathname.replace(/^\/(forum)/, '/forum');
      console.log(`Yönlendiriliyor: ${pathname} -> ${newPath}`);
      router.replace(newPath);
    }
  }, [pathname, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Yönlendiriliyor...</p>
    </div>
  );
} 