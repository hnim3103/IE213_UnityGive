import React from 'react';

const UnityStrength = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-8 leading-tight text-slate-900 dark:text-white">
            Tại Sao Chọn Nền Tảng <br />
            <span className="text-primary">UnityGive Của Chúng Tôi?</span>
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center text-primary border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Minh Bạch 100%</h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Mỗi đồng tiền đều được theo dõi và báo cáo. Chúng tôi đảm bảo kinh phí đến đúng nơi với bằng chứng xác thực.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center text-coral border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Phí Nền Tảng Thấp</h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Chúng tôi duy trì chi phí vận hành tối thiểu để đảm bảo phần lớn quyên góp của bạn đi thẳng tới người cần giúp đỡ.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center text-primary border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Dẫn Dắt Bởi Cộng Đồng</h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Các chiến dịch được xác minh và hỗ trợ bởi một mạng lưới tình nguyện viên và nhà hảo tâm toàn cầu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="relative mt-12 lg:mt-0">
          <div className="aspect-square rounded-[3rem] overflow-hidden rotate-3 shadow-2xl border-4 border-white dark:border-slate-800">
            {/* Added a reliable placeholder image from Unsplash */}
            <img 
              alt="Tình nguyện viên đang làm việc" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000" 
            />
          </div>

          {/* Floating Stats Card */}
          <div className="absolute -bottom-10 -left-6 md:-left-10 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl hidden md:block border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                <img alt="User 1" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" />
                <img alt="User 2" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" />
                <img alt="User 3" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">12k+ Nhà Hảo Tâm</span>
            </div>
            <p className="text-2xl font-bold text-primary">60 Tỷ VNĐ+</p>
            <p className="text-xs text-slate-500 font-medium">Tổng Quỹ Đã Gây Được Trong Năm</p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default UnityStrength;