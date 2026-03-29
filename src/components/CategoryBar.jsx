function CategoryBar({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          <button
            onClick={() => setSelectedCategory('ทั้งหมด')}
            className={`rounded-full border px-4 py-2 transition ${
              selectedCategory === 'ทั้งหมด'
                ? 'border-sky-400 bg-sky-50 text-sky-600'
                : 'border-gray-200 hover:border-sky-400 hover:text-sky-500'
            }`}
          >
            ทั้งหมด
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 transition ${
                selectedCategory === category
                  ? 'border-sky-400 bg-sky-50 text-sky-600'
                  : 'border-gray-200 hover:border-sky-400 hover:text-sky-500'
              }`}
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