'use client'

import { useState } from 'react'

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for personal use and basic privacy protection',
      features: [
        'Automatic history deletion',
        'Up to 10 custom domains',
        'Preset domain library (read-only)',
        'Configurable deletion delay (3/10/30s)',
        'Usage statistics',
        'Quick cleanup (5min/15min/1hour)',
        'Local storage only',
        'Community support'
      ],
      cta: 'Get Started Free',
      href: 'https://github.com/cengfanman/auto-purge',
      popular: false
    },
    {
      name: 'Pro',
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      description: 'Advanced features for power users and maximum privacy',
      features: [
        'Everything in Free, plus:',
        'Unlimited custom domains',
        'Shadow history with encryption',
        'PIN-protected shadow history access',
        'Export shadow history (HTML/CSV)',
        'Advanced scheduling options',
        'Bulk domain import/export',
        'Custom deletion patterns',
        'Priority email support',
        'Early access to new features'
      ],
      cta: 'Upgrade to Pro',
      href: '#',
      popular: true
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return '$0'
    return billingPeriod === 'monthly'
      ? `$${plan.monthlyPrice}`
      : `$${plan.yearlyPrice}`
  }

  const getPeriod = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 'forever'
    return billingPeriod === 'monthly' ? 'per month' : 'per year'
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0 || billingPeriod === 'monthly') return null
    const monthlyCost = plan.monthlyPrice * 12
    const savings = monthlyCost - plan.yearlyPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return percentage
  }

  const faqs = [
    {
      question: 'What happens if I upgrade to Pro?',
      answer: 'You\'ll instantly unlock all Pro features including unlimited custom domains, shadow history with encryption, and priority support. Your existing settings and domains will be preserved.'
    },
    {
      question: 'Can I cancel my Pro subscription anytime?',
      answer: 'Yes, you can cancel anytime. You\'ll continue to have Pro access until the end of your current billing period, then automatically revert to the Free plan.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Absolutely. We use industry-standard payment processors and never store your credit card information on our servers.'
    },
    {
      question: 'What is shadow history?',
      answer: 'Shadow history (Pro feature) maintains an encrypted backup of deleted URLs, allowing you to recover them if needed. All data is encrypted with your PIN and stored locally on your device.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with Pro, contact us within 30 days of purchase for a full refund.'
    },
    {
      question: 'Can I use AutoPurge on multiple devices?',
      answer: 'Yes! The Free plan works on unlimited devices. Pro subscriptions are per-user and can be used across all your Chrome browsers when signed in with the same account.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100 mb-8">
            Choose the plan that's right for you. Start free, upgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-lg shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-600' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{getPrice(plan)}</span>
                    <span className="text-gray-600 ml-2">/ {getPeriod(plan)}</span>
                    {getSavings(plan) && (
                      <div className="mt-2">
                        <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                          Save {getSavings(plan)}% with yearly
                        </span>
                      </div>
                    )}
                  </div>

                  <a
                    href={plan.href}
                    target={plan.name === 'Free' ? '_blank' : undefined}
                    rel={plan.name === 'Free' ? 'noopener noreferrer' : undefined}
                    className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition mb-8 ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </a>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className={`text-gray-700 ${feature.endsWith(':') ? 'font-semibold text-gray-900' : ''}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Feature Comparison</h2>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Automatic History Deletion</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Custom Domains</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Up to 10</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Preset Domain Library</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Shadow History (Encrypted)</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400 text-xl">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Export History (HTML/CSV)</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400 text-xl">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Bulk Import/Export</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400 text-xl">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Priority Support</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400 text-xl">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users protecting their privacy with AutoPurge
          </p>
          <a
            href="https://github.com/cengfanman/auto-purge"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Install Free Extension
          </a>
        </div>
      </section>
    </div>
  )
}
