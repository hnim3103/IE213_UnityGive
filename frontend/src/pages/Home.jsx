import React from 'react';
import Hero from '../components/Hero';
import ActiveCampaigns from '../components/ActiveCampaigns';
import HowItWorks from '../components/HowItWorks';
import ImpactStats from '../components/ImpactStats';
import TrustSecurity from '../components/TrustSecurity';

const Home = () => {
  return (
    <>
      <Hero />
      <ActiveCampaigns />
      <HowItWorks />
      <ImpactStats />
      <TrustSecurity />
    </>
  );
};

export default Home;
