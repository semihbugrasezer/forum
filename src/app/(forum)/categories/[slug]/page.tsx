import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/category/CategoryContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params }: PageProps) {
  // Await params object first
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const category = {
    title: slug.replace(/-/g, ' '),
    id: slug,
    slug: slug,
    count: 0
  };

  if(!category) return notFound();

  return (
    <div className="container mx-auto p-4">
      <CategoryContent category={category} />
    </div>
  );
}
