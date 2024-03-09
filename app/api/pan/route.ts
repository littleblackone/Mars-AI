import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const panUrl = "https://api.goapi.ai/mj/v2/pan";

const handlePan = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.originTaskId || !body.direction) {
      console.log("missing originTaskId or direction");
      return NextResponse.json(
        { error: "missing originTaskId or direction" },
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
        direction: body.direction,
        notify_progress: true,
      },
      url: panUrl,
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

export const POST = handlePan;
