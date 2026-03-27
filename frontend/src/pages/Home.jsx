import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ActiveCampaigns from '../components/ActiveCampaigns';
import UnityStrenght from '../components/UnityStrenght';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#fefefe]">
      <Navbar />
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ActiveCampaigns />
      </div>
      <UnityStrenght />
      <Footer />
    </div>
  );
};

export default Home;
