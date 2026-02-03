import React from 'react'

const Footer = () => {
  return (
    <footer class="bg-slate-900 text-white pt-20 pb-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 border-b border-slate-800 pb-20">
          <div class="col-span-1 lg:col-span-1">
            <div class="flex items-center gap-2 mb-6">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-sm">volunteer_activism</span>
              </div>
              <span class="text-xl font-extrabold tracking-tight">Unity<span class="text-primary">Give</span></span>
            </div>
            <p class="text-slate-400 mb-8">Trao quyền cho cộng đồng thông qua gây quỹ minh bạch và có tác động từ năm 2018.</p>
            <div class="flex gap-4">
              <a class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-all" href="#"><span class="material-symbols-outlined text-sm">public</span></a>
              <a class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-all" href="#"><span class="material-symbols-outlined text-sm">alternate_email</span></a>
              <a class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-all" href="#"><span class="material-symbols-outlined text-sm">share</span></a>
            </div>
          </div>
          <div>
            <h5 class="font-bold text-lg mb-6">Chiến Dịch</h5>
            <ul class="space-y-4 text-slate-400">
              <li><a class="hover:text-primary transition-colors" href="#">Giáo Dục</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Môi Trường</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Cứu Trợ Khẩn Cấp</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Hỗ Trợ Y Tế</a></li>
            </ul>
          </div>
          <div>
            <h5 class="font-bold text-lg mb-6">Tài Nguyên</h5>
            <ul class="space-y-4 text-slate-400">
              <li><a class="hover:text-primary transition-colors" href="#">Câu Chuyện Nhà Hảo Tâm</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Cách Thức Hoạt Động</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Báo Cáo Minh Bạch</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Trung Tâm Trợ Giúp</a></li>
            </ul>
          </div>
          <div>
            <h5 class="font-bold text-lg mb-6">Cập Nhật Tin Tức</h5>
            <p class="text-slate-400 mb-4">Đăng ký để nhận báo cáo tác động hàng tháng.</p>
            <div class="relative">
              <input class="w-full bg-slate-800 border-none rounded-full py-3 px-6 text-sm focus:ring-2 focus:ring-primary" placeholder="Địa chỉ email" type="email"/>
              <button class="absolute right-2 top-2 bottom-2 bg-primary text-white px-4 rounded-full text-xs font-bold">Tham Gia</button>
            </div>
          </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2026 UnityGive. Bảo lưu mọi quyền.</p>
          <div class="flex gap-8 mt-4 md:mt-0">
            <a class="hover:text-slate-300" href="#">Chính Sách Bảo Mật</a>
            <a class="hover:text-slate-300" href="#">Điều Khoản Dịch Vụ</a>
            <a class="hover:text-slate-300" href="#">Chính Sách Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer