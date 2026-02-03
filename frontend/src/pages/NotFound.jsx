import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center bg-slate-50'>
      <img
        src='404_NotFound.png'
        alt='Not found'
        className='max-w-full mb-6 w-96'/>

        <p className="text-xl font-semibold">
          Bạn đang đi vào vùng cấm địa 🚫
        </p>

        <a href="/" className='inline-block px-6 py-3 mt-6 font-medium text-white rounded-2xl bg-green-400 hover:bg-green-500'>
          Quay về trang chủ
        </a>
    </div>
  );
};
export default NotFound