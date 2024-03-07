'use client'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { UserData } from '@/lib/interface/ImageData'
import { useCredits } from '@/lib/store/useCredits'
import { CrownIcon, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UserCreditsClient({ userData, email, }: { userData: UserData, email: string }) {


  const infinityai_user_credits = useCredits(state => state.infinityai_user_credits)
  const router = useRouter()
  const expiryDate = userData.subscription_expiry + ''
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger>
        <div className='flex items-center gap-2 cursor-pointer text-white bg-[#818CF8] p-2 py-[4px] rounded-lg'>
          <span>{infinityai_user_credits === 0 ? userData.infinityai_user_credits : infinityai_user_credits}</span>
          <Sparkles width={15} height={15}></Sparkles>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className='text-white flex-center flex-col gap-2 w-fit'>
        到期时间:{expiryDate.split('T')[0]}
        <Button onClick={() => router.push('/#price')} className='flex gap-2 items-center w-full dark:text-white bg-[#818CF8] dark:bg-[#818CF8] dark:hover:bg-[#5b65c5] hover:bg-[#5b65c5]' type='button'>
          <CrownIcon width={25} height={25} color="white"></CrownIcon>
          <span className=' text-lg font-medium'>升级</span>
        </Button>
      </HoverCardContent>
    </HoverCard>

  )
}
