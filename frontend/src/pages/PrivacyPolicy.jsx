import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen selection:bg-sage-800 text-gray-800">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            Last Updated April 21, 2026
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-gray-900 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            At UnityGive, we believe transparency is the foundation of trust.
            This policy outlines how we curate and protect your digital
            footprint within our commons.
          </p>
        </div>

        {/* Quote Section */}
        <div className="bg-gray-50 border-l-4 border-sage-800 px-6 sm:px-8 py-8 rounded-lg mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 hover:border-sage-800 hover:shadow-md transition-all hover:-translate-y-2 hover:shadow-lg">
          <blockquote className="text-base sm:text-lg italic text-gray-700 leading-relaxed ">
            "Our commitment to privacy is not merely a legal requirement, but a
            stewardship of the human connection. We treat your data with the
            same reverence as the causes we support."
          </blockquote>
        </div>

        {/* Information Collection Section */}
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-6">
            Information Collection
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            UnityGive collects information that you provide directly to us when
            you create an account, initiate a donation, or register for a
            volunteer program. This may include your legal name, email address,
            physical address, and organizational affiliations.
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We also collect technical metadata to ensure the security and
            performance of our platform. This includes anonymized IP addresses,
            browser types, and interaction patterns within the interface. We
            utilize this to optimize the "Curated Commons" experience for all
            users.
          </p>

          {/* Cookie Usage */}
          <div className="bg-gray-50 border-l-4 border-sage-800 px-6 sm:px-8 py-8 rounded-lg mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 hover:border-sage-800 hover:shadow-md transition-all hover:-translate-y-2 hover:shadow-lg">
            <h3 className="text-base font-bold tracking-widest text-gray-700 uppercase mb-4">
              Cookie Usage
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              We use essential cookies to maintain your session. Analytics
              cookies are only deployed with your explicit consent to help us
              understand which impact programs resonate most with our community.
            </p>
          </div>
        </section>

        {/* Image Section */}
        <div className="my-16 rounded-3xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 hover:shadow-2xl transition-shadow hover:-translate-y-2 group">
          <img
            src="https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-zoomed-in-view-of-a-contract-in-a-clipboard-positioned-on-image_13590887.png"
            alt="Privacy and Legal Documents"
            className="w-full h-96 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </div>

        {/* Use of Data Section */}
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-6">
            Use of Data
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The data we collect serves the primary purpose of facilitating
            impactful giving. Specifically, we use your information to:
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start p-4 rounded-lg bg-transparent hover:bg-sage-50/50 transition-colors group">
              <svg
                className="w-6 h-6 text-sage-800 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                Process and verify philanthropic transactions with global
                financial institutions
              </span>
            </li>
            <li className="flex items-start p-4 rounded-lg bg-transparent hover:bg-sage-50/50 transition-colors group">
              <svg
                className="w-6 h-6 text-sage-800 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                Generate personalized impact reports that detail the tangible
                outcomes of your contributions
              </span>
            </li>
            <li className="flex items-start p-4 rounded-lg bg-transparent hover:bg-sage-50/50 transition-colors group">
              <svg
                className="w-6 h-6 text-sage-800 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                Match your volunteer profile with organizations that align with
                your specific skills and geography
              </span>
            </li>
          </ul>

          <p className="text-gray-600 leading-relaxed">
            UnityGive does not sell, rent, or trade your personal information to
            third-party marketing entities. Your presence in our commons is
            valued, not commodified.
          </p>
        </section>

        {/* Data Protection Section */}
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8">
            Data Protection
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Security at UnityGive is architectural. We employ industry-leading
            encryption standards (AES-256) for data at rest and TLS for data in
            transit. Our infrastructure is segmented to ensure that sensitive
            financial data remains isolated from general user profiles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Encryption Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:border-sage-800 group cursor-default">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-sage-800/10 group-hover:bg-sage-800 transition-colors flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-sage-800 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-gray-900">Encryption</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Multi-layered cryptographic protocols protecting every
                interaction within the ecosystem.
              </p>
            </div>

            {/* Access Control Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:border-sage-800 group cursor-default">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-sage-800/10 group-hover:bg-sage-800 transition-colors flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-sage-800 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-gray-900">
                  Access Control
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Strict least-privilege access for UnityGive stewards, audited
                quarterly for compliance.
              </p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            In the unlikely event of a security compromise, UnityGive maintains
            a rigorous incident-response protocol that includes immediate user
            notification and full transparency regarding the scope of the event.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
