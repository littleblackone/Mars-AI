import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const outPaintUrl = "https://api.goapi.ai/mj/v2/outpaint";

const handleOutPaint = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.originTaskId || !body.zoomRatio) {
      console.log("missing originTaskId or zoomRatio");
      return NextResponse.json(
        { error: "missing originTaskId or zoomRatio" },
        {
          status: 400,
        }
      );
    }

    const options = {
      headers: {
        "X-API-KEY": process.env.GOAPI_KEY,
      },
      data: {
        origin_task_id: body.originTaskId,
        zoom_ratio: body.zoomRatio,
        notify_progress: true,
      },
      url: outPaintUrl,
      method: "post",
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

export const POST = handleOutPaint;
