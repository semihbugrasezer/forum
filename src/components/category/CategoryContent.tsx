"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

export function CategoryContent({ category }: { category: any }) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{category.title}</h1>
        {user && (
          <Button asChild>
            <Link href="/new-topic">Yeni Konu</Link>
          </Button>
        )}
      </div>
      
      {/* Konu listesi */}
      <div className="space-y-4">
        {/* API bağlantısı yapılacak */}
      </div>
    </div>
  );
} 