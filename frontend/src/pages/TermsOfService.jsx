import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen selection:bg-sage-800 text-gray-800">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
            Effective as of January 2026
          </p>
          <h1 className="text-5xl sm:text-6xl font-serif italic text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
            Our commitment to transparency and the collective impact of the
            digital commons. Please read these terms carefully before engaging
            with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1 ">
            <div className="sticky top-24 space-y-6 ">
              <div className="bg-sage-400/20 p-6 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                <h3 className="text-sm font-bold tracking-widest text-gray-700 uppercase mb-6">
                  Article I
                </h3>
                <h4 className="text-xl font-serif text-gray-900 mb-2">
                  User Agreement
                </h4>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  The foundational understanding between you and the UnityGive
                  ecosystem.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-16">
            {/* User Agreement Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="mb-8">
                <p className="text-gray-600 mb-6 leading-relaxed font-light">
                  By accessing or using UnityGive, you acknowledge that you have
                  read, understood, and agree to be bound by these Terms of
                  Service and our Privacy Policy. This agreement constitutes a
                  legally binding contract between you and UnityGive regarding
                  your use of the platform.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed font-light">
                  To use certain features, you must register for an account. You
                  represent that the information you provide is accurate and
                  that you will maintain its accuracy. You are solely
                  responsible for maintaining the confidentiality of your
                  account credentials.
                </p>

                {/* Quote */}
                <div className="bg-gray-50 border-l-4 border-sage-800 px-6 sm:px-8 py-8 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 hover:border-sage-800 hover:shadow-md transition-all hover:-translate-y-2 hover:shadow-lg">
                  <blockquote className="text-lg italic text-gray-700 leading-relaxed">
                    "UnityGive operates on the principle of mutual trust. We
                    provide the tools, you provide the intent. Together, we
                    curate the future of giving."
                  </blockquote>
                </div>
              </div>
            </section>

            {/* Integrity Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <h2 className="text-3xl font-serif text-gray-900 mb-6">
                Integrity of Service
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                You may not engage in any activity that interferes with or
                disrupts the Service, including the use of automated systems or
                bots to scrape data or manipulate giving metrics.
              </p>
              <p className="text-gray-600 leading-relaxed font-light">
                Unauthorized access to our systems, attempted privilege
                escalation, or any malicious activity will result in immediate
                account suspension and may trigger legal proceedings.
              </p>
            </section>

            {/* Community Standards Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <h2 className="text-3xl font-serif text-gray-900 mb-6">
                Community Standards
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed font-light">
                Harassment, hate speech, and the distribution of harmful content
                are strictly prohibited. UnityGive reserves the right to
                terminate accounts that violate our core mission of positive
                collective impact.
              </p>

              {/* Prohibited Activities Card */}
              <div className="bg-sage-800 text-white rounded-3xl px-8 sm:px-10 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600 hover:shadow-2xl transition-shadow">
                <h3 className="text-2xl font-serif italic mb-6">
                  Prohibited Activities
                </h3>
                <p className="text-sage-100 font-light mb-6 leading-relaxed">
                  Ensuring the digital commons remains a safe space for all
                  contributions.
                </p>
                <div className="space-y-4">
                  {[
                    "Fraudulent campaigns or misrepresentation of funds",
                    "Harassment, hate speech, or discriminatory behavior",
                    "Automated scraping or data manipulation",
                    "Circumvention of security protocols",
                    "Distribution of malware or phishing attempts",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-earth-500 flex-shrink-0 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Financial Compliance Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
              <h2 className="text-3xl font-serif text-gray-900 mb-6">
                Financial Compliance
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                Misuse of the donation processing systems, including fraudulent
                transactions or attempts to bypass security protocols, will
                result in immediate permanent suspension and potential legal
                action.
              </p>
              <p className="text-gray-600 leading-relaxed font-light">
                All transactions are subject to anti-money laundering (AML) and
                know-your-customer (KYC) requirements. UnityGive reserves the
                right to freeze accounts pending regulatory review.
              </p>
            </section>

            {/* Limitation of Liability Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-800">
              <h2 className="text-3xl font-serif text-gray-900 mb-6">
                Limitation of Liability
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed font-light">
                Understanding the bounds of our responsibility in the delivery
                of our services.
              </p>

              <p className="text-gray-600 mb-8 leading-relaxed font-light">
                The service is provided "as is" and "as available." UnityGive
                makes no warranties, expressed or implied, regarding the
                continuous availability or absolute security of the digital
                infrastructure.
              </p>

              <p className="text-gray-600 mb-8 leading-relaxed font-light">
                To the maximum extent permitted by law, UnityGive shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits of revenues, whether
                incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses.
              </p>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-all hover:-translate-y-2 group">
                  <p className="text-4xl font-bold text-sage-800 mb-2">99.3%</p>
                  <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    Uptime Goal
                  </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-all hover:-translate-y-2 group">
                  <p className="text-4xl font-bold text-sage-800 mb-2">
                    AES-256
                  </p>
                  <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    Encryption Standard
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-900">
              <h2 className="text-3xl font-serif text-gray-900 mb-6">
                Changes to These Terms
              </h2>
              <p className="text-gray-600 leading-relaxed font-light">
                UnityGive reserves the right to modify these Terms of Service at
                any time. Changes will be effective immediately upon posting.
                Your continued use of the platform following the posting of
                revised Terms means that you accept and agree to the changes.
              </p>
            </section>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-gray-100 rounded-3xl px-8 sm:px-12 py-12 sm:py-16 text-center mt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
          <h2 className="text-3xl font-serif mb-4">
            Questions about these terms?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto font-light">
            Our legal and community teams are available to discuss our
            governance and terms at any time.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-sage-800 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-sage-900 transition-all hover:scale-105 active:scale-95"
          >
            Contact Information
          </Link>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
