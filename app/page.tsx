import pic1 from "@/public/midjourneyV6/v6pic1.jpg";
import pic2 from "@/public/midjourneyV6/v6pic2.jpg";
import pic3 from "@/public/midjourneyV6/v6pic3.jpg";
import pic4 from "@/public/midjourneyV6/v6pic4.jpg";
import pic6 from "@/public/midjourneyV6/v6pic6.jpg";
import pic7 from "@/public/midjourneyV6/v6pic7.jpg";
import pic8 from "@/public/midjourneyV6/v6pic8.jpg";
import pic9 from "@/public/midjourneyV6/v6pic9.jpg";
import pic10 from "@/public/midjourneyV6/v6pic10.jpg";
import pic11 from "@/public/midjourneyV6/v6pic11.jpg";
import pic12 from "@/public/midjourneyV6/v6pic12.jpg";
import pic13 from "@/public/midjourneyV6/v6pic13.jpg";
import pic14 from "@/public/midjourneyV6/v6pic14.jpg";
import Image from "next/image";
import Link from "next/link";

const Imgs = [
  pic1,
  pic2,
  pic3,
  pic4,
  pic6,
  pic7,
  pic8,
  pic9,
  pic10,
  pic11,
  pic12,
  pic13,
  pic14,
];
export default function Home() {
  return (
    <main className="flex items-center flex-col p-12">
      <div className="text-center">
        <h1 className=" leading-[5rem] text-bg text-6xl font-bold ">
          轻松画出您的梦想, AI 艺术为您提供无限创作灵感
        </h1>
        <h1 className=" leading-[3rem] text-bg text-4xl font-bold  mt-4">
          使用最新的Midjourney V6引擎, 体验人工智能艺术的巅峰
        </h1>
      </div>
      <Link href="/create" className="mt-16 start-btn text-center">
        <span className="text">开 始</span>
      </Link>
      <div className="gap-4 mt-16 xl:columns-4 columns-2">
        {Imgs.map((img, index) => {
          return (
            <div className="rounded-lg cursor-pointer">
              <Image
                key={index}
                src={img}
                alt="v6pic"
                className=" mb-4 rounded-lg hover:scale-105 transition-all duration-300 "
              ></Image>
            </div>
          );
        })}
      </div>
    </main>
  );
}
