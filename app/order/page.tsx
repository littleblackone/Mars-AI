'use client'
import { useSearchParams } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function page() {
  const searchParams = useSearchParams()
  const qrCodeUrl = searchParams.get('QrcodeUrl')
  const name = searchParams.get('name')
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(300); // 5分钟，单位：秒

  useEffect(() => {
    const timer = setInterval(() => {
      // 更新剩余时间
      setRemainingTime(prevTime => prevTime - 1);
    }, 1000); // 每秒更新一次


    // 清除计时器
    return () => clearInterval(timer);
  }, []); // 仅在组件挂载时启动计时器


  useEffect(() => {
    if (remainingTime === 0) {
      router.push('/');
    }
  }, [remainingTime, router]);

  // 将剩余时间转换为分钟和秒
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div className=' w-screen h-screen flex-center'>
      <div className='h-[500px] w-[500px] flex flex-col gap-2 items-center justify-center'>
        <img src="/wxpay.png" alt="wxpay" width={300} />
        <img src={qrCodeUrl!} alt="wxpay qrcode img" width={300} height={300} />
        <div className=' '>
          <span className=' text-lg font-semibold'>商品名称:</span>
          <span className=' ml-2 text-2xl font-medium'>
            {name}
          </span>
        </div>


        <div className=' text-gray-500'>
          二维码有效时间:
          <span className='ml-4 mr-2 text-red-500 text-2xl font-bold'>
            {minutes}
          </span>
          <span className='text-xl font-bold'>:</span>
          <span className=' ml-2 text-red-500 text-2xl font-bold'>
            {seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      </div>
    </div>
  )
}
