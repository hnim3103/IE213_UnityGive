import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import heroImage from '../assets/hero-image.png'

const Hero = () => {

  return (
    <section className="relative bg-sage-bg min-h-[80vh] flex items-center overflow-hidden py-20">
      {/* Background Decorations */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-sage-700/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-earth-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* Left Side: Text Content */}
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl md:text-7xl font-fraunces font-thin text-sage-800 tracking-tight leading-[1.1]">
              Changing trust <br /> through <br />
              <span className="italic font-normal text-earth-500">transparency</span>
            </h1>

            <p className="text-xl md:text-2xl font-nunito font-extralight text-earth-900 leading-relaxed max-w-lg">
              A decentralized fundraising platform connecting compassionate hearts directly with world-changing cam. Every contribution is verified and tracked on the blockchain.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link to="/campaigns">
              <Button className="bg-sage-800 hover:bg-sage-900 text-white px-10 py-7 rounded-full text-lg shadow-xl shadow-sage-800/20 transition-[transform,colors] active:scale-[0.98] group flex items-center gap-2">
                Start Donating
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button variant="outline" className="border-2 border-sage-200 text-sage-800 hover:bg-sage-100/50 px-10 py-7 rounded-full text-lg transition-colors font-nunito">
                Explore Campaigns
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Content */}
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
          {/* Main Hero Image with subtle rotation */}
          <div className="relative rotate-1 group">
            <div className="absolute inset-0 bg-sage-800/10 rounded-[32px] translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6" />
            <div className="overflow-hidden rounded-bl-[32px] rounded-br-[48px] rounded-tl-[40px] rounded-tr-[24px] shadow-2xl border-4 border-white/50 bg-sage-100">
              <img
                src={heroImage}
                alt="Community Impact"
                width="600"
                height="400"
                fetchPriority="high"
                className="w-full h-auto object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>

          {/* Floating Impact Card */}
          <div className="absolute bottom-[-20px] right-[-10px] md:right-[-32px] max-w-[320px] bg-[#e5e3d6]/95 backdrop-blur-md p-6 rounded-bl-[24px] rounded-br-[40px] rounded-tl-[32px] rounded-tr-[16px] shadow-2xl border border-white/50 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-[#ffc38f] rounded-full flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[#794e25] text-xl" aria-hidden="true">favorite</span>
              </div>
              <span className="font-nunito italic font-extralight text-sage-800 text-lg">Social Impact</span>
            </div>
            <p className="font-nunito italic font-extralight text-earth-900 text-[14px] leading-relaxed">
              "Our mission is to change the world with absolute transparency."
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero
