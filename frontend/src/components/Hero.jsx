import React from 'react'
import hero_img from './../assets/Hero_background.jpg'

const Hero = () => {
  return (
    <div className='relative h-80[vh] min-h-150 flex items-center overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <img src={hero_img} alt="Ảnh cộng đồng ý nghĩa" className='w-full h-full object-cover' />
        <div class="absolute inset-0 hero-gradient"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div class="max-w-3xl">
          <span class="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold uppercase tracking-wider">
            Tham Gia Phong Trào Toàn Cầu
          </span>
          <h1 class="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 font-display">
            Kết Nối, Hỗ Trợ và <br/><span class="text-coral italic font-instrument">Thay Đổi Cuộc Sống</span> Trực Tuyến
          </h1>
          <p class="text-xl md:text-2xl text-slate-200 mb-10 font-light leading-relaxed">
            Một nền tảng gây quỹ minh bạch, an toàn và vì cộng đồng. Mỗi sự đóng góp đều tạo nên một thế giới khác biệt.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
          <button class="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:scale-105 hover:cursor-pointer transition-transform shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
            Bắt Đầu Gây Quỹ <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <button class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 hover:cursor-pointer transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">play_circle</span> Xem Tác Động
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero