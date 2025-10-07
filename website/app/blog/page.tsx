import Link from 'next/link'

const blogPosts = [
  {
    id: 1,
    title: 'Introducing AutoPurge: Automatic History Cleaning Made Simple',
    excerpt: 'Learn how AutoPurge helps protect your browsing privacy with automatic history deletion for specified domains.',
    date: '2025-01-15',
    author: 'AutoPurge Team',
    category: 'Product',
    slug: 'introducing-autopurge'
  },
  {
    id: 2,
    title: 'Why Browser History Privacy Matters',
    excerpt: 'Understanding the importance of controlling your digital footprint and how browser history can reveal sensitive information.',
    date: '2025-01-10',
    author: 'AutoPurge Team',
    category: 'Privacy',
    slug: 'browser-history-privacy'
  },
  {
    id: 3,
    title: 'Getting Started with AutoPurge: A Complete Guide',
    excerpt: 'Step-by-step instructions for installing and configuring AutoPurge to protect your browsing privacy.',
    date: '2025-01-05',
    author: 'AutoPurge Team',
    category: 'Tutorial',
    slug: 'getting-started-guide'
  },
  {
    id: 4,
    title: 'Chrome Extension Manifest V3: What You Need to Know',
    excerpt: 'How AutoPurge leverages the latest Chrome extension platform for enhanced security and performance.',
    date: '2024-12-20',
    author: 'AutoPurge Team',
    category: 'Technology',
    slug: 'manifest-v3-explained'
  },
  {
    id: 5,
    title: 'Pro Features: Advanced Privacy Protection',
    excerpt: 'Discover the advanced features available in AutoPurge Pro, including shadow history and unlimited custom domains.',
    date: '2024-12-15',
    author: 'AutoPurge Team',
    category: 'Product',
    slug: 'pro-features-overview'
  },
  {
    id: 6,
    title: 'Best Practices for Online Privacy',
    excerpt: 'Tips and strategies for maintaining your privacy online, from browser extensions to VPNs and beyond.',
    date: '2024-12-10',
    author: 'AutoPurge Team',
    category: 'Privacy',
    slug: 'online-privacy-best-practices'
  }
]

export default function Blog() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AutoPurge Blog</h1>
          <p className="text-xl text-blue-100">
            Privacy tips, product updates, and technology insights
          </p>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">{post.date}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {post.author}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination (placeholder) */}
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300" disabled>
                Previous
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                1
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                2
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Subscribe to our newsletter for privacy tips and product updates
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
