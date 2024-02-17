import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const seedUrl = "https://api.midjourneyapi.xyz/mj/v2/seed";

const handleGetSeed = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.taskId) {
      console.log("missing origin task id");
      return NextResponse.json(
        { error: "missing origin task id" },
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
        task_id: body.taskId,
      },
      url: seedUrl,
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

export const POST = handleGetSeed;
