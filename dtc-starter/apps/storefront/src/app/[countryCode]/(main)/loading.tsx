import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

// Shown right away while any shop page without its own skeleton loads.
export default function Loading() {
  return (
    <div className="content-container py-12" data-testid="page-loader">
      <div className="mb-8 flex flex-col gap-3 animate-pulse">
        <div className="h-8 w-64 bg-gray-100" />
        <div className="h-4 w-96 max-w-full bg-gray-100" />
      </div>
      <SkeletonProductGrid numberOfProducts={8} />
    </div>
  )
}
