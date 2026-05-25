import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full text-center">
          <div className="relative mb-8 inline-block">
            <img
              src="/404_NotFound.png"
              alt="404 Not Found"
              className="w-full max-w-md mx-auto drop-shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-instrument italic text-sage-800 mb-4">
            Oops! Page Not Found
          </h1>

          <p className="text-lg md:text-xl text-sage-800/90 font-nunito mb-10 max-w-lg mx-auto">
            It seems like you've wandered into uncharted territory. The page you're looking for might have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button className="bg-sage-600 hover:bg-sage-700 text-sage-100 px-10 py-6 rounded-full font-bold text-lg shadow-lg transition-all">
                Back to Home
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button variant="outline" className="border-sage-800/20 text-sage-800 hover:bg-sage-100 px-10 py-6 rounded-full font-bold text-lg transition-all">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
