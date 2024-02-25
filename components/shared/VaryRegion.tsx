import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ThickArrowRightIcon } from "@radix-ui/react-icons";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  FetchImageData,
  InpaintData,
  TaskResult,
} from "@/app/interface/ImageData";
import axios from "axios";
import { useInpaintImages } from "@/lib/store/useInpaintImages";
import { toast } from "sonner";
import { handleGetSeed } from "@/lib/utils";
import { X } from "lucide-react";
import { useIsInpainting } from "@/lib/store/useisInpainting";
import { useIsCropLoading } from "@/lib/store/useIsCropLoading";

export default function VaryRegion({
  open,
  setOpen,
  originTaskId,
  setOriginTaskId,
  setParentSeed,
  parentPrompt,
  setParentImageArr,
  selectedIndex,
  parentimageArr,
}: InpaintData) {
  const cropperRef = useRef<ReactCropperElement>(null);

  const [prompt, setPrompt] = useState(parentPrompt);

  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const [cropBoxHeight, setCropBoxHeight] = useState(0);
  const [cropBoxWidth, setcropBoxWidth] = useState(0);
  const [cropBoxX, setcropBoxX] = useState(0);
  const [cropBoxY, setcropBoxY] = useState(0);

  const [blackWhiteImg, setBlackWhiteImg] = useState("");

  const isInpainting = useIsInpainting((state) => state.isInpainting);
  const setIsInpainting = useIsInpainting((state) => state.setIsInpainting);
  const setInpaintImages = useInpaintImages((state) => state.setImages);

  // parentimageArr = [
  //   "https://cdn.midjourney.com/b4637836-433c-4e39-bbbd-2d42df177832/0_3.webp",
  //   "https://cdn.midjourney.com/b4637836-433c-4e39-bbbd-2d42df177832/0_3.webp",
  //   "https://cdn.midjourney.com/b4637836-433c-4e39-bbbd-2d42df177832/0_3.webp",
  //   "https://cdn.midjourney.com/b4637836-433c-4e39-bbbd-2d42df177832/0_3.webp",
  // ];

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;

    const height = cropper?.getCropBoxData().height;
    const width = cropper?.getCropBoxData().width;
    const top = cropper?.getCropBoxData().top;
    const left = cropper?.getCropBoxData().left;
    const imgHeight = cropper?.getImageData().height;
    const imgWidth = cropper?.getImageData().width;

    setTimeout(() => {
      setCanvasHeight(imgHeight || 0);
      setCanvasWidth(imgWidth || 0);
      setcropBoxWidth(width || 0);
      setCropBoxHeight(height || 0);
      setcropBoxX(left || 0);
      setcropBoxY(top || 0);
    }, 200);
  };

  useEffect(() => {
    if (
      cropBoxHeight !== 0 ||
      cropBoxWidth !== 0 ||
      cropBoxX !== 0 ||
      cropBoxY !== 0 ||
      canvasHeight !== 0 ||
      canvasWidth !== 0
    ) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";

        if (
          canvasWidth / canvasHeight === 1 ||
          canvasWidth / canvasHeight > 1
        ) {
          ctx.fillRect(cropBoxX, cropBoxY, cropBoxWidth, cropBoxHeight);
        } else {
          {
            const newCropBoxX = cropBoxX - (600 - canvasWidth) / 2;
            if (newCropBoxX > 0) {
              ctx.fillRect(newCropBoxX, cropBoxY, cropBoxWidth, cropBoxHeight);
            } else {
              ctx.fillRect(0, cropBoxY, cropBoxWidth, cropBoxHeight);
            }
          }
        }

        const base64Image = canvas.toDataURL();
        setBlackWhiteImg(base64Image);
      }
    }
  }, [
    cropBoxHeight,
    cropBoxWidth,
    cropBoxX,
    cropBoxY,
    canvasHeight,
    canvasWidth,
  ]);

  const handleInpaint = async () => {
    try {
      setIsInpainting(true);

      let inpaintId: string = "";
      let isFirstIntervalCompleted: boolean = false;

      const upscaleResponse = await axios.post("/api/upscale", {
        originTaskId,
        index: selectedIndex + 1 + "",
      });

      const taskId = upscaleResponse.data.task_id;

      const upscaleIntervalId = setInterval(async () => {
        try {
          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId,
            }
          );

          if (taskResult.data.status === "finished") {
            clearInterval(upscaleIntervalId);

            const response = await axios.post("/api/inpaint", {
              mask: blackWhiteImg,
              originTaskId: taskId,
              prompt,
            });

            inpaintId = response.data.task_id;

            isFirstIntervalCompleted = true;
          }
        } catch (error) {
          console.error("Error ", error);
        }
      }, 1000);

      const intervalId = setInterval(async () => {
        if (isFirstIntervalCompleted === false) return;

        const taskResult: FetchImageData = await axios.post("/api/fetchImage", {
          taskId: inpaintId,
        });

        if (taskResult.data.status === "finished") {
          clearInterval(intervalId);
          setIsInpainting(false);
          setOriginTaskId(taskResult.data.task_id);
          setParentImageArr(taskResult.data.task_result.image_urls);
          setInpaintImages(taskResult.data.task_result.image_urls);
          await handleGetSeed(inpaintId, setParentSeed);
          toast.success("Vary(Region)成功!");
        }
      }, 1000);
    } catch (error) {
      toast.error("请求失败，请查看图片地址格式是否正确");
      console.error("Error handle describe:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!min-w-[800px] h-[800px]  flex flex-col items-center justify-center">
        <div className="w-[600px] h-[600px] flex-center mt-4">
          <Cropper
            zoomable={false}
            toggleDragModeOnDblclick={false}
            movable={false}
            src={parentimageArr[selectedIndex]}
            disabled={isInpainting}
            className={`rounded-sm max-w-[100%] max-h-[100%] ${
              isInpainting && `flicker`
            }`}
            alt="midjourney image"
            initialAspectRatio={1}
            crop={onCrop}
            ref={cropperRef}
            responsive={true}
            viewMode={1}
          ></Cropper>
        </div>

        <div className=" w-full h-fit relative rounded-xl flex items-center bg-gray-100 border-4 border-black/60 focus:border-black/80">
          <Input
            type="text"
            autoFocus={true}
            // value={prompt}
            placeholder="描述你选择的区域"
            onChange={(e) => setPrompt(e.target.value)}
            className=" self-center  rounded-xl bg-transparent p-[1.5rem] focus-visible:ring-transparent focus-visible:ring-offset-transparent"
          ></Input>
          <Button
            type="button"
            className=" rounded-xl mr-2"
            onClick={() => {
              handleInpaint();
              setOpen(false);
            }}
          >
            <span>发送</span>
            <ThickArrowRightIcon className="ml-2"></ThickArrowRightIcon>
          </Button>
        </div>
        <DialogClose
          disabled={isInpainting}
          className="absolute right-2 top-2 rounded-sm opacity-70  transition-opacity hover:opacity-100  disabled:pointer-events-none "
        >
          <X className="h-5 w-5" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
