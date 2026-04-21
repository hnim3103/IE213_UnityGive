import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const ContactSupport = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen selection:bg-sage-800 text-gray-800  font-nunito">
      {/* 1. Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
            Concierge Support
          </p>
          <h1 className="text-5xl sm:text-6xl font-serif italic text-gray-900 mb-8 leading-tight">
            We are here to steward
            <br />
            your journey.
          </h1>
          <p className="text-base text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Whether you are establishing a legacy or coordinating local efforts,
            our team provides the administrative grace required for true impact.
          </p>
        </div>

        {/* 2. Contact Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 w-full">
          {/* Left: Office address */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-200 w-full">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-serif text-gray-900">
                Office address
              </h3>
            </div>

            {/* Google Map */}
            <div className="bg-gray-100 rounded-2xl p-0 mb-6 h-80 flex items-center justify-center group overflow-hidden shadow-lg">
              <iframe
                title="Office address UnityGive"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3545.7903219185064!2d106.80210489999999!3d10.870419199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527e7e8abb0eb%3A0xec43e4b99472c18a!2zVUlUIC0gQ-G7lW5nIEE!5e1!3m2!1svi!2s!4v1776784133051!5m2!1svi!2s"
                width="180%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                  Address
                </p>
                <p className="text-sm text-gray-900 font-medium leading-snug">
                  Ward 34, Linh Xuan Commune
                  <br />
                  Ho Chi Minh City, Vietnam
                </p>
              </div>
              <a
                href="https://maps.app.goo.gl/HHX7EDS5pb38xweN9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sage-800 hover:text-sage-900 font-medium text-sm transition-colors"
              >
                Get Directions →
              </a>
            </div>
          </div>

          {/* Right Content: Email & Phone Support */}
          <div className="lg:col-span-1 flex flex-col justify-center space-y-8 h-full animate-in fade-in slide-in-from-right-4 duration-700 delay-300 -mt-8">
            {/* Direct Correspondence Card */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">✉️</span>
                <div>
                  <h3 className="text-xl font-serif text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600 font-light mt-1">
                    unitygive@unitygive.com
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 hover:border-sage-800">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                      Response Time
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      Within 24 Hours
                    </p>
                  </div>
                  <a
                    href="mailto:unitygive@unitygive.com"
                    className="inline-flex items-center justify-center bg-sage-800 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-sage-900 transition-all active:scale-95"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">📞</span>
                <div>
                  <h3 className="text-xl font-serif text-gray-900">
                    Phone Support
                  </h3>
                  <p className="text-sm text-gray-600 font-light mt-1">
                    +84 979 460 958
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 hover:border-sage-800">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                      Monday - Friday
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      9:00 AM - 5:00 PM GMT+7
                    </p>
                  </div>
                  <a
                    href="tel:+84979460958"
                    className="inline-flex items-center justify-center bg-sage-800 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-sage-900 transition-all active:scale-95"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Banner Image Section */}
        <div className="my-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="relative overflow-hidden rounded-3xl h-80 shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sage-900/90 via-sage-900/40 to-transparent" />
            <div className="relative h-full flex items-center px-12">
              <h2 className="text-3xl sm:text-4xl font-serif italic text-white leading-tight max-w-lg">
                Built for the commons,
                <br />
                sustained by the community.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
