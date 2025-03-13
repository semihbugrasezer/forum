import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/category/CategoryContent";

export default function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const category = {
    title: params.slug.replace(/-/g, ' '),
    id: params.slug,
    slug: params.slug,
    count: 0
  }

  if(!category) return notFound();

  return (
    <div className="container mx-auto p-4">
      <CategoryContent category={category} />
    </div>
  );
}
