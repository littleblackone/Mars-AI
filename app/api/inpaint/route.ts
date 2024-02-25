import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const inpaintUrl = "https://api.midjourneyapi.xyz/mj/v2/inpaint";

const handleInPaint = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.originTaskId || !body.mask) {
      console.log("missing origin task id or mask");
      return NextResponse.json(
        { error: "missing origin task id or mask" },
        {
          status: 400,
        }
      );
    }

    const options = {
      headers: {
        "X-API-KEY": process.env.GOAPI_KEY,
        "Content-Type": "application/json",
      },
      data: {
        origin_task_id: body.originTaskId,
        prompt: body.prompt,
        mask: body.mask,
        notify_progress: true,
      },
      url: inpaintUrl,
      method: "post",
      maxBodyLength: Infinity,
    };

    const response = await axios(options);

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error: ${error}`);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = handleInPaint;
