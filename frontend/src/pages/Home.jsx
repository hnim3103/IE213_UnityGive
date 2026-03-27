import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ActiveCampaigns from '../components/ActiveCampaigns';
import HowItWorks from '../components/HowItWorks';
import ImpactStats from '../components/ImpactStats';
import TrustSecurity from '../components/TrustSecurity';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white">
      <Navbar />
      <Hero />
      <ActiveCampaigns />
      <HowItWorks />
      <ImpactStats />
      <TrustSecurity />
      <Footer />

    </div>
  );
};

export default Home;
