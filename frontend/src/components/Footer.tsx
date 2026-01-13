 
 export function Footer() {
    return (
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Product Explorer. All rights reserved.</p>
            <p className="text-sm mt-2">
              Data sourced from{' '}
              <a
                href="https://www.worldofbooks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                World of Books
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
  }
