import { useState } from "react";

export default function Test() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Scrollable Page Demo
          </h1>
          <button
            onClick={openPopup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Open Popup
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Our Demo Page
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This page demonstrates scrollable content with a popup modal. Scroll
            down to see more content, and click the button above to trigger the
            popup.
          </p>
        </section>

        {/* Content Sections */}
        {[1, 2, 3, 4, 5, 6].map((section) => (
          <section key={section} className="mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Section {section}: Lorem Ipsum Content
              </h3>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo.
                </p>
                {section % 2 === 0 && (
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                    <p className="text-indigo-800">
                      This is a highlighted section with additional information
                      that makes the content more interesting and adds visual
                      variety to the scrollable page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Call to Action */}
        <section className="text-center py-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to See the Popup?</h3>
            <p className="text-lg mb-6 opacity-90">
              Click the button below to trigger the popup modal and see it in
              action.
            </p>
            <button
              onClick={openPopup}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Trigger Popup
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-300">
            © 2025 Scrollable Demo Page. Built with React and Tailwind CSS.
          </p>
        </div>
      </footer>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          data-popup
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closePopup}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close popup"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <h4 className="text-2xl font-bold text-gray-800 mb-2">
                Popup Modal
              </h4>
              <p className="text-gray-600">
                This is a popup modal triggered by button clicks!
              </p>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                This modal demonstrates how popups can be implemented in React.
                You can close this modal by clicking the X button, clicking
                outside the modal, or pressing the close button below.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closePopup}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={closePopup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
