// Shown inside the portal (the side menu stays) while a page loads.
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" data-testid="portal-loader">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 medium:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-24 rounded-lg bg-white border border-gray-200" />
        ))}
      </div>
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-20 rounded-lg bg-white border border-gray-200" />
      ))}
    </div>
  )
}
