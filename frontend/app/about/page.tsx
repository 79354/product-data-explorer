export default function AboutPage() {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Product Explorer</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700">
              Product Explorer is a full-stack product exploration platform that enables users to
              navigate from high-level headings to categories to products and detailed product pages.
              All data is sourced from World of Books through intelligent, on-demand web scraping.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Frontend:</strong> Next.js 14 (App Router), TypeScript, Tailwind CSS, SWR</li>
              <li><strong>Backend:</strong> NestJS, TypeScript, PostgreSQL, TypeORM</li>
              <li><strong>Scraping:</strong> Crawlee, Playwright</li>
              <li><strong>Caching:</strong> Database-level with TTL, Redis for job queues</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Real-time web scraping with intelligent caching</li>
              <li>Responsive design for desktop and mobile</li>
              <li>Browse history tracking</li>
              <li>Product reviews and ratings</li>
              <li>On-demand data refresh</li>
              <li>Accessible WCAG AA compliant interface</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-700">
              For questions or feedback, please visit our{' '}
              <a href="https://github.com" className="text-blue-600 hover:underline">
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    );
  }
