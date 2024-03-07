import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const varyUrl = "https://api.goapi.ai/mj/v2/variation";

const handleVary = async (req: NextRequest) => {
  try {
    const body = await req.json();

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
      url: varyUrl,
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

export const POST = handleVary;
