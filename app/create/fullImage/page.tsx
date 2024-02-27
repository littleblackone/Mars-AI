"use client";
import { Button } from "@/components/ui/button";
import { useBlendImages } from "@/lib/store/useBlendImages";
import { useExpandImages } from "@/lib/store/useExpandImages";
import { useInpaintImages } from "@/lib/store/useInpaintImages";
import { useOriginImage } from "@/lib/store/useOriginImage";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { useVaryImage } from "@/lib/store/useVaryImage";
import { useZoomImages } from "@/lib/store/useZoomImages";
import { handleDownload } from "@/lib/utils";
import { DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
export default function page() {
  const params = useSearchParams();

  const index = params.get("index");
  const imgListName = params.get("imgListName");
  const imgUrl = params.get("imgUrl");

  const deleteOriginImgs = useOriginImage((state) => state.deleteImage);

  const deleteVaryImgs = useVaryImage((state) => state.deleteImage);

  const deleteUpscaleImgs = useUpscaleImage((state) => state.deleteImage);

  const deleteZoomImgs = useZoomImages((state) => state.deleteImage);

  const deleteExpandImgs = useExpandImages((state) => state.deleteImage);

  const deleteBlendImgs = useBlendImages((state) => state.deleteImage);

  const deleteInpaintImgs = useInpaintImages((state) => state.deleteImage);

  // const handleDelete = () => {
  //   // 检查 imgListName 与每个列表的名称是否相同，然后调用相应的 delete 方法
  //   if (imgListName) {
  //     if (imgListName === "originImageList") {
  //       deleteOriginImgs(index !== null ? +index : 0);
  //     } else if (imgListName === "varyImageList") {
  //       deleteVaryImgs(index !== null ? +index : 0);
  //     } else if (imgListName === "upscaleImageList") {
  //       deleteUpscaleImgs(index !== null ? +index : 0);
  //     } else if (imgListName === "zoomImageList") {
  //       deleteZoomImgs(index !== null ? +index : 0);
  //     } else if (imgListName === "expandImageList") {
  //       deleteExpandImgs(index !== null ? +index : 0);
  //     } else if (imgListName === "blendImageList") {
  //       deleteBlendImgs(index !== null ? +index : 0);
  //     } else if (imgListName === "inpaintImageList") {
  //       deleteInpaintImgs(index !== null ? +index : 0);
  //     }
  //   }
  // };
  interface DeleteMethods {
    [key: string]: (index: number) => void;
  }

  const deleteMethods: DeleteMethods = {
    originImageList: deleteOriginImgs,
    varyImageList: deleteVaryImgs,
    upscaleImageList: deleteUpscaleImgs,
    zoomImageList: deleteZoomImgs,
    expandImageList: deleteExpandImgs,
    blendImageList: deleteBlendImgs,
    inpaintImageList: deleteInpaintImgs,
  };

  const handleDelete = () => {
    // 根据 imgListName 获取对应的删除方法并调用
    if (imgListName && deleteMethods[imgListName]) {
      deleteMethods[imgListName](index !== null ? +index : 0);
    }
  };

  return (
    <div className=" w-screen h-screen bg-white relative">
      <img
        src={imgUrl as string}
        alt={`${imgListName}[${index}] image`}
        className=" w-full h-full object-contain"
      ></img>
      <div className=" absolute right-8 top-4 flex flex-col gap-4 ml-4 items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            handleDownload(imgUrl as string, index !== null ? +index : 0);
          }}
        >
          <DownloadIcon
            width={20}
            height={20}
            className=" cursor-pointer "
          ></DownloadIcon>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            handleDelete();
          }}
        >
          <TrashIcon
            width={20}
            height={20}
            className=" cursor-pointer "
          ></TrashIcon>
        </Button>
      </div>
      <Link href="/create">
        <Button
          type="button"
          variant="outline"
          className=" absolute left-4 top-4"
        >
          <ArrowLeft width={20} height={20}></ArrowLeft>
        </Button>
      </Link>
    </div>
  );
}
