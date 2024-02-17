import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const imagineUrl = "https://api.midjourneyapi.xyz/mj/v2/upscale";

const handleUpscale = async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log(body);

    if (!body.originTaskId || !body.index) {
      console.log("missing origin task id or index");
      return NextResponse.json(
        { error: "missing origin task id or index" },
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
        index: body.index,
        notify_progress: true,
      },
      url: imagineUrl,
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

export const POST = handleUpscale;
