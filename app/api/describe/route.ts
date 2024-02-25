import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const describeUrl = "https://api.midjourneyapi.xyz/mj/v2/describe";

const handleDescribe = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const useTurbo = body.useTurbo;
    if (!body.imageUrl) {
      console.log("missing online image url");
      return NextResponse.json(
        { error: "missing online image url" },
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
        image_url: body.imageUrl,
        notify_progress: true,
        process_mode: useTurbo ? "turbo" : "fast",
      },
      url: describeUrl,
      method: "post",
    };

    const response = await axios(options);

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    console.log(error);

    console.error(`Error: ${error}`);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = handleDescribe;
