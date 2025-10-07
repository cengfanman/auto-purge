import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Privacy, Automatically Protected
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              AutoPurge automatically removes browsing history for specified domains after you leave the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/cengfanman/auto-purge"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Install Extension
              </a>
              <Link
                href="/pricing"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Privacy Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to keep your browsing private
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-3">Automatic Deletion</h3>
              <p className="text-gray-600">
                Removes URLs from Chrome history after leaving the page with configurable delay (3, 10, or 30 seconds)
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Smart Domain Matching</h3>
              <p className="text-gray-600">
                Works with both exact domains and subdomains. Built-in preset library plus custom domain support
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-gray-600">
                No data uploaded to servers. All processing happens locally on your device
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Usage Statistics</h3>
              <p className="text-gray-600">
                Track deletion counts without storing URLs. Monitor your privacy protection
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Quick Cleanup</h3>
              <p className="text-gray-600">
                One-click deletion of recent history: last 5 minutes, 15 minutes, or 1 hour
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold mb-3">Custom Domains</h3>
              <p className="text-gray-600">
                Add your own domains to monitor. Up to 10 on free plan, unlimited on Pro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Configure Domains</h3>
              <p className="text-gray-600">
                Add domains you want to monitor from preset library or custom list
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Normally</h3>
              <p className="text-gray-600">
                Extension monitors your navigation for matching domains
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Leave the Page</h3>
              <p className="text-gray-600">
                When you navigate away, deletion timer starts
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Auto Cleanup</h3>
              <p className="text-gray-600">
                After configured delay, URL is removed from Chrome history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Protect Your Privacy?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Install AutoPurge today and browse with confidence
          </p>
          <a
            href="https://github.com/cengfanman/auto-purge"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </div>
  )
}
