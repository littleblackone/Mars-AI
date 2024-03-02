import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-main-bg">
      <Header></Header>
      <div className="p-32">
        <main className="flex items-center flex-col p-32">
          <div className="text-center">
            <h1 className=" leading-[5rem] text-bg text-6xl font-bold ">
              轻松画出您的梦想, AI 艺术为您提供无限创作灵感
            </h1>
            <h1 className=" leading-[3rem] text-bg text-4xl font-bold  mt-4">
              使用最新的Midjourney V6、Niji 6引擎, 体验人工智能艺术的巅峰
            </h1>
          </div>
          <Link href="/create" className="mt-16 start-btn text-center">
            <span className="text">开 始</span>
          </Link>
        </main>
      </div>
      <Footer></Footer>
    </div>
  );
}
