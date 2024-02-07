import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { CopyIcon, EnterFullScreenIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { FullViewData } from "@/app/interface/ImageData";
import { Badge } from "../ui/badge";
import { extractArAndModel } from "@/lib/utils";
import { toast } from "sonner";

export function ImageFullView({
  index,
  taskId,
  imgUrl,
  tempFormValue,
  seed,
  finalPrompt,
}: FullViewData) {
  const negativeWords = tempFormValue?.negativePrompt?.split(" ");

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("prompt已复制到剪贴板");
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="active:translate-y-[1px] rounded-md bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
        >
          <EnterFullScreenIcon
            width={20}
            height={20}
            color="white"
          ></EnterFullScreenIcon>
        </button>
      </DialogTrigger>
      <DialogContent className=" !h-[800px]  min-w-[1260px]">
        <div className="flex w-full h-full ">
          <div className=" flex-1 w-full h-full flex-center bg-gray-300/25 rounded-l-md">
            <img
              src={imgUrl}
              className="w-[80%] h-full"
              alt="full view img"
            ></img>
          </div>
          <div className=" max-w-[20rem] flex p-2 flex-col  h-full bg-gray-400/25 rounded-r-md">
            <div className=" bg-white p-4 mt-4 rounded-md flex flex-col">
              <div className="flex gap-2 items-center">
                <p className=" text-lg">Prompt</p>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-center h-8 w-8 p-0"
                  onClick={() => handleCopy(finalPrompt)}
                >
                  <CopyIcon height={12} width={12}></CopyIcon>
                </Button>
              </div>
              <p className=" text-sm text-gray-600 leading-5">
                {tempFormValue?.prompt}
              </p>

              <div className="flex gap-2 flex-wrap mt-2">
                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">ar</span>
                  <span className="ml-1 text-gray-800">
                    {extractArAndModel(tempFormValue?.aspectRatio || "")}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">model</span>
                  <span className="ml-1 text-gray-800">
                    {extractArAndModel(tempFormValue?.model || "")}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">stylize</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.stylize}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">seed</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.seeds || seed}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">chaos</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.chaos}
                  </span>
                </Badge>
                {tempFormValue?.negativePrompt &&
                  negativeWords?.map((word) => (
                    <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                      <span className=" text-gray-500">no</span>
                      <span className="ml-1 text-gray-800">{word}</span>
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
