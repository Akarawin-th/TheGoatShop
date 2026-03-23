function CategoryBar({ categories }) {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-sky-400 hover:text-sky-500"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryBar