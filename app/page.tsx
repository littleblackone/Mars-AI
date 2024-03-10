'use client'
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import TypeEffect from "@/components/shared/TypeEffect";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/priceTabs";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUser()

  const router = useRouter()
  const email = user?.emailAddresses[0].emailAddress
  return (
    <div className="bg-[#111827]">
      <Header></Header>
      <div className="p-32">
        <main className="flex items-center flex-col p-32">
          <div className="text-center">
            <h1 className=" leading-[5rem] text-bg text-6xl font-bold ">
              轻松画出您的梦想, AI 艺术为您提供无限创作灵感
            </h1>
            <h1 className=" leading-[3rem] text-bg text-4xl font-bold  mt-4">
              使用最新的Midjourney V6、Niji 6模型, 体验人工智能艺术的巅峰
            </h1>
          </div>
          <div className="my-8 mt-16 flex gap-2 items-center">
            <TypeEffect></TypeEffect>
            <Link href="/create" className="start-btn flex-center text-center">
              <span className="text">开 始</span>
            </Link>
          </div>

          <div id="price" className="flex flex-col items-center mt-32 gap-6">
            <span className="text-[#818CF8] text-lg font-medium">价格</span>
            <h1 className=" text-white text-5xl font-semibold">定制你的创意之旅, 从我们的订阅计划开始</h1>
            <h2 className=" text-gray-300 text-xl font-medium">选择一个适合自己的计划, 不论你是爱好者, 设计师, 还是艺术家和创作者</h2>
            <div className="">
              <Tabs defaultValue="pay-per-cycle" className="flex flex-col gap-2 flex-center">
                <TabsList className=" bg-[#1D2432] p-1 rounded-xl mb-4">
                  <TabsTrigger value="pay-per-cycle" className=" rounded-xl text-white">按周期</TabsTrigger>
                  <TabsTrigger value="pay-per-use" className=" rounded-xl text-white">按次</TabsTrigger>
                </TabsList>
                <TabsContent value="pay-per-cycle">
                  <div className="flex gap-8">
                    <div className=' border rounded-xl border-gray-600 w-[20rem] gap-4 h-fit flex flex-col justify-start p-8 py-12 bg-inherit'>
                      <div className="flex w-full justify-between items-center">
                        <p className=" text-white font-semibold text-2xl">1个月</p>
                        <div className="flex items-center text-white gap-2 bg-[#818CF8] p-2 py-1 rounded-xl">
                          1000
                          <Sparkles width={15} hanging={15}></Sparkles>
                        </div>
                      </div>
                      <p className=" text-gray-200 text-sm">相当于100张v5.2模型快速图</p>
                      <div className="flex">
                        <p className="text-white text-4xl font-bold">79元</p>
                        <span className=" text-gray-200 text-base self-end translate-y-[-1.5px]">/月</span>
                      </div>
                      <Button type="button" onClick={async () => {
                        if (!user) {
                          router.push('/sign-in')
                          return
                        }
                        const payRes = await axios.post('/api/pay', { payType: 'oneMonthPay', email });
                        const QrcodeUrl = payRes.data.data.QRcode_url

                        router.push(`/order?QrcodeUrl=${QrcodeUrl}&name=infinity AI 一个月订阅`)
                      }} className=" hover:bg-gray-500 bg-gray-700">
                        购买计划
                      </Button>
                      <ul className="flex flex-col gap-4 text-sm">
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">15个可调整参数</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持文生图, 图生文, 图生图</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持v 5.2, v 6, niji 6最新模型</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">复刻discord中对图片的所有操作</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">光速下载图片</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">turbo模式</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持image prompt, sref风格参考</p>
                        </li>
                        <li className="flex gap-4 text-[#818CF8] items-center">
                          <Check width={15} height={15} color="#818CF8"></Check>
                          <p className="">一键下载所有历史图片</p>
                        </li>
                      </ul>
                    </div>
                    <div className=' border-2 rounded-xl border-[#818CF8] w-[20rem] gap-4 h-fit flex flex-col justify-start p-8 py-16 -translate-y-4 bg-[#1D2432]'>
                      <div className="flex w-full justify-between items-center">
                        <p className=" text-white font-semibold text-2xl">3个月</p>
                        <div className="flex items-center text-white gap-2 bg-[#818CF8] p-2 py-1 rounded-xl">
                          3000
                          <Sparkles width={15} hanging={15}></Sparkles>
                        </div>
                      </div>
                      <p className=" text-gray-200 text-sm">相当于300张v5.2模型快速图</p>
                      <div className="flex">
                        <p className="text-white text-4xl font-bold">237元</p>
                        <span className=" text-gray-200 text-base self-end translate-y-[-1.5px]">/月</span>
                      </div>
                      <Button onClick={async () => {
                        if (!user) {
                          router.push('/sign-in')
                          return
                        }
                        const payRes = await axios.post('/api/pay', { payType: 'threeMonthPay', email });
                        const QrcodeUrl = payRes.data.data.QRcode_url

                        router.push(`/order?QrcodeUrl=${QrcodeUrl}&name=infinity AI 三个月订阅`)
                      }} type="button" className=" hover:bg-[#8f98ee] bg-[#818CF8]">
                        购买计划
                      </Button>
                      <ul className="flex flex-col gap-4 text-sm">
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">15个可调整参数</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持文生图, 图生文, 图生图</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持v 5.2, v 6, niji 6最新模型</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">复刻discord中对图片的所有操作</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">光速下载图片</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">turbo模式</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持image prompt, sref风格参考</p>
                        </li>
                        <li className="flex gap-4 text-[#818CF8] items-center">
                          <Check width={15} height={15} color="#818CF8"></Check>
                          <p className="">一键下载所有历史图片</p>
                        </li>
                      </ul>
                    </div>
                    <div className=' border rounded-xl border-gray-600 w-[20rem] gap-4 h-fit flex flex-col justify-start p-8 py-12 bg-inherit'>
                      <div className="flex w-full justify-between items-center">
                        <p className=" text-white font-semibold text-2xl">12个月</p>
                        <div className="flex items-center text-white gap-2 bg-[#818CF8] p-2 py-1 rounded-xl">
                          12000
                          <Sparkles width={15} hanging={15}></Sparkles>
                        </div>
                      </div>
                      <p className=" text-gray-200 text-sm">相当于1200张v5.2模型快速图</p>
                      <div className="flex">
                        <p className="text-white text-4xl font-bold">948元</p>
                        <span className=" text-gray-200 text-base self-end translate-y-[-1.5px]">/月</span>
                      </div>
                      <Button onClick={async () => {
                        if (!user) {
                          router.push('/sign-in')
                          return
                        }
                        const payRes = await axios.post('/api/pay', { payType: 'twelveMonthPay', email });
                        const QrcodeUrl = payRes.data.data.QRcode_url

                        router.push(`/order?QrcodeUrl=${QrcodeUrl}&name=infinity AI 十二个月订阅`)
                      }} type="button" className="hover:bg-gray-500 bg-gray-700">
                        购买计划
                      </Button>
                      <ul className="flex flex-col gap-4 text-sm">
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">15个可调整参数</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持文生图, 图生文, 图生图</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持v 5.2, v 6, niji 6最新模型</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">复刻discord中对图片的所有操作</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">光速下载图片</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">turbo模式</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持image prompt, sref风格参考</p>
                        </li>
                        <li className="flex gap-4 text-[#818CF8] items-center">
                          <Check width={15} height={15} color="#818CF8"></Check>
                          <p className="">一键下载所有历史图片</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="pay-per-use">
                  <div className="flex gap-8">
                    <div className=' border rounded-xl border-gray-600 w-[20rem] gap-4 h-fit flex flex-col justify-start p-8 py-12 bg-inherit'>
                      <div className="flex w-full justify-between items-center">
                        <p className=" text-white font-semibold text-2xl">永久</p>
                        <div className="flex items-center text-white gap-2 bg-[#818CF8] p-2 py-1 rounded-xl">
                          200
                          <Sparkles width={15} hanging={15}></Sparkles>
                        </div>
                      </div>
                      <p className=" text-gray-200 text-sm">相当于20张v5.2模型快速图</p>
                      <div className="flex">
                        <p className="text-white text-4xl font-bold">20元</p>
                      </div>
                      <Button onClick={async () => {
                        if (!user) {
                          router.push('/sign-in')
                          return
                        }
                        const payRes = await axios.post('/api/pay', { payType: 'twentyPay', email });
                        const QrcodeUrl = payRes.data.data.QRcode_url

                        router.push(`/order?QrcodeUrl=${QrcodeUrl}&name=infinity AI 200积分`)
                      }} type="button" className=" hover:bg-gray-500 bg-gray-700">
                        购买计划
                      </Button>
                      <ul className="flex flex-col gap-4 text-sm">
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">15个可调整参数</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持文生图, 图生文, 图生图</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持v 5.2, v 6, niji 6最新模型</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">复刻discord中对图片的所有操作</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">光速下载图片</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">turbo模式</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持image prompt, sref风格参考</p>
                        </li>
                      </ul>
                    </div>
                    <div className=' border-2 rounded-xl border-[#818CF8] w-[20rem] gap-4 h-fit flex flex-col justify-start p-8 py-16 -translate-y-4 bg-[#1D2432]'>
                      <div className="flex w-full justify-between items-center">
                        <p className=" text-white font-semibold text-2xl">永久</p>
                        <div className="flex items-center text-white gap-2 bg-[#818CF8] p-2 py-1 rounded-xl">
                          500
                          <Sparkles width={15} hanging={15}></Sparkles>
                        </div>
                      </div>
                      <p className=" text-gray-200 text-sm">相当于50张v5.2模型快速图</p>
                      <div className="flex">
                        <p className="text-white text-4xl font-bold">50元</p>
                      </div>
                      <Button onClick={async () => {
                        if (!user) {
                          router.push('/sign-in')
                          return
                        }
                        const payRes = await axios.post('/api/pay', { payType: 'fiftyPay', email });
                        const QrcodeUrl = payRes.data.data.QRcode_url

                        router.push(`/order?QrcodeUrl=${QrcodeUrl}&name=infinity AI 500积分`)
                      }} type="button" className=" hover:bg-[#8f98ee] bg-[#818CF8]">
                        购买计划
                      </Button>
                      <ul className="flex flex-col gap-4 text-sm">
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">15个可调整参数</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持文生图, 图生文, 图生图</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持v 5.2, v 6, niji 6最新模型</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">复刻discord中对图片的所有操作</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">光速下载图片</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">turbo模式</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持image prompt, sref风格参考</p>
                        </li>
                      </ul>
                    </div>
                    <div className=' border rounded-xl border-gray-600 w-[20rem] gap-4 h-fit flex flex-col justify-start p-8 py-12 bg-inherit'>
                      <div className="flex w-full justify-between items-center">
                        <p className=" text-white font-semibold text-2xl">永久</p>
                        <div className="flex items-center text-white gap-2 bg-[#818CF8] p-2 py-1 rounded-xl">
                          1000
                          <Sparkles width={15} hanging={15}></Sparkles>
                        </div>
                      </div>
                      <p className=" text-gray-200 text-sm">相当于100张v5.2模型快速图</p>
                      <div className="flex">
                        <p className="text-white text-4xl font-bold">100元</p>
                      </div>
                      <Button onClick={async () => {
                        if (!user) {
                          router.push('/sign-in')
                          return
                        }
                        const payRes = await axios.post('/api/pay', { payType: 'hundredPay', email });
                        const QrcodeUrl = payRes.data.data.QRcode_url

                        router.push(`/order?QrcodeUrl=${QrcodeUrl}&name=infinity AI 1000积分`)
                      }} type="button" className="hover:bg-gray-500 bg-gray-700">
                        购买计划
                      </Button>
                      <ul className="flex flex-col gap-4 text-sm">
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">15个可调整参数</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持文生图, 图生文, 图生图</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持v 5.2, v 6, niji 6最新模型</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">复刻discord中对图片的所有操作</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">光速下载图片</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">turbo模式</p>
                        </li>
                        <li className="flex gap-4 text-gray-300 items-center">
                          <Check width={15} height={15} color="white"></Check>
                          <p className="">支持image prompt, sref风格参考</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className=" w-full flex-col flex-center mt-16 text-gray-300">
            <p className="text-lg text-[#818CF8]">FAQ</p>

            <Accordion type='multiple' className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className=" text-xl text-gray-200">是使用官方midjourney生成的图片吗? 是如何工作的?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base">
                  是的, 相当于帮你在discord中控制midjourney机器人生成图片,采用第三方api实现。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className=" text-xl text-gray-200">有多少discord中的功能?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base">
                  本网站复现了所有discrod中对图片的操作,包括imagine,vary(strong,subtle,region),expand(right,left,up,down),zoom(1.5,2,make square,custom),upscale(1,2,3,4,2x,4x,subtle,creative),describe,blend
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className=" text-xl text-gray-200">有多少参数可以调整?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base">
                  一共有15个参数可以调整(model(v 5.2, v 6, niji 6), aspect ratios(可自定义), chaos, image weight, no, quality, seed, stop, stylize, tile, turbo, weird, image prompt url, sref url, style raw),通过易操作的表格快速调整图片的各种参数
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className=" text-xl text-gray-200">积分的消耗规则?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base flex flex-col gap-4">
                  <span>
                    Imagine/Vary/Zoom/Expand/Blend: v 5.2操作消耗:10积分, v 5.2 turbo模式消耗15积分<br></br>
                  </span>
                  <span>
                    Imagine/Vary/Zoom/Expand/Blend: v 6, niji 6操作消耗:15积分<br></br>
                  </span>
                  <span>
                    Describe/Upscale(1,2,3,4)操作消耗: 1积分<br></br>
                  </span>
                  <span>
                    v 5.2 Upscale2x 操作消耗: 15积分<br></br>
                  </span>
                  <span>
                    v 5.2 Upscale4x 操作消耗: 30积分<br></br>
                  </span>
                  <span>
                    v 6,niji 6 Upscale subtle 操作消耗: 12积分<br></br>
                  </span>
                  <span>
                    v 6,niji 6 Upscale creative 操作消耗: 12积分<br></br>
                  </span>
                  <span>比如我先使用imagine生成一张图片(10积分), 再使用Zoom放大图片(11积分), 再使用Upscale subtle提高图片分辨率(13积分), 一共消耗34积分(对图片进行操作首先要upscale(1,2,3,4)放大图片,消耗1积分)</span>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className=" text-xl text-gray-200">生成的图片可以下载吗?下载速度快吗?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base">
                  历史图片区域包括你生成的每一张图片, 都可以免费下载, 由于我们会手动把图片转化为base64数据, 所以下载没有延迟, 实现光速下载
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className=" text-xl text-gray-200">国内可以使用吗?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base">
                  国内可以使用,如果只是简单的进行imagine操作没什么问题,但是涉及到其他耗时的任务比如upscale,建议使用科学上网,网越快越稳定出图越快,后续应该会使用服务器代理让国内用户也能快速出图
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger className=" text-xl text-gray-200">可以同时进行多个任务吗?</AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base">
                  可以的,多个任务会进入等待队列,任务完成后会通知并自动出现在历史图片区域,不过请注意imagine,zoom,expand,vary(region)这四个操作生成的4张图片会占据中间的4个图,比如你用imagine生成了4张图,对其中某一张进行了expand,expand任务进入等待队列,如果任务完成,expand生成的4张图会代替之前imagine生成的4张图,这是为了能继续操作不同类型的图片
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </main>
      </div>
      <Footer></Footer>
    </div>
  );
}
