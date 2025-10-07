import Link from 'next/link'

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About AutoPurge</h1>
          <p className="text-xl text-blue-100">
            Making privacy protection effortless for everyone
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-4">
            AutoPurge was created to address a simple but important need: protecting your browsing privacy without requiring constant manual intervention. We believe that privacy should be automatic, not an afterthought.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            In today's digital age, your browsing history can reveal intimate details about your life, interests, and activities. Whether you're researching sensitive health topics, shopping for surprise gifts, or simply value your privacy, AutoPurge ensures your browsing history remains under your control.
          </p>
        </div>
      </section>

      {/* Why AutoPurge Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why AutoPurge?</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🔒 Privacy First</h3>
              <p className="text-gray-700">
                We never collect, store, or transmit your browsing data. Everything happens locally on your device. We don't have analytics, tracking, or telemetry of any kind.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">⚡ Simple & Effective</h3>
              <p className="text-gray-700">
                Set it once and forget it. AutoPurge works silently in the background, automatically cleaning your history for configured domains without any manual intervention.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🛠️ Customizable</h3>
              <p className="text-gray-700">
                Choose from preset domain lists or add your own custom domains. Configure deletion delays that work for your browsing habits. Make it work the way you want.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🌟 Open Source</h3>
              <p className="text-gray-700">
                Our code is open source and available on GitHub. We believe in transparency and welcome community contributions to make AutoPurge even better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology</h2>
          <p className="text-lg text-gray-700 mb-4">
            AutoPurge is built using Chrome Extension Manifest V3, the latest and most secure extension platform. Key technical features include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Service worker architecture for efficient background processing</li>
            <li>Debounced deletion queue to avoid duplicate operations</li>
            <li>Smart subdomain matching using hostname analysis</li>
            <li>Local storage only - no external server communication</li>
            <li>Minimal permission model for maximum security</li>
          </ul>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-lg text-gray-700 mb-6">
            AutoPurge is developed and maintained by a small team of privacy advocates and developers who believe that everyone deserves control over their digital footprint.
          </p>
          <p className="text-lg text-gray-700">
            We're committed to keeping AutoPurge free, open source, and privacy-focused. Our Pro plan helps support ongoing development and maintenance while keeping the core functionality accessible to everyone.
          </p>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-lg text-gray-700 mb-6">
            We'd love to hear from you! Whether you have questions, feedback, or just want to say hello:
          </p>
          <div className="space-y-3 text-lg">
            <p>
              📧 Email: <a href="mailto:support@autopurge.shop" className="text-blue-600 hover:underline">support@autopurge.shop</a>
            </p>
            <p>
              💬 Telegram: <a href="https://t.me/autopurge_support" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@autopurge_support</a>
            </p>
            <p>
              💬 Discord: <a href="https://discord.gg/jsh8xK8Wzq" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join our server</a>
            </p>
            <p>
              🐙 GitHub: <a href="https://github.com/cengfanman/auto-purge" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cengfanman/auto-purge</a>
            </p>
          </div>
          <div className="mt-8">
            <Link href="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
