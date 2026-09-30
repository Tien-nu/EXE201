import SkeletonButton from "@modules/skeletons/components/skeleton-button"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

const SkeletonProductPage = () => {
  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-page-loader"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6 animate-pulse">
          <div className="w-24 h-5 bg-gray-100" />
          <div className="w-full h-10 bg-gray-100" />
          <div className="flex flex-col gap-y-2">
            <div className="w-full h-4 bg-gray-100" />
            <div className="w-full h-4 bg-gray-100" />
            <div className="w-3/4 h-4 bg-gray-100" />
          </div>
        </div>
        <div className="block w-full relative px-0 small:px-8">
          <div className="aspect-[29/34] w-full bg-gray-100 animate-pulse" />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6 animate-pulse">
          <div className="w-1/3 h-5 bg-gray-100" />
          <div className="w-full h-10 bg-gray-100" />
          <div className="w-1/2 h-8 bg-gray-100" />
          <SkeletonButton />
        </div>
      </div>
      <div className="content-container my-16 small:my-32">
        <SkeletonRelatedProducts />
      </div>
    </>
  )
}

export default SkeletonProductPage
