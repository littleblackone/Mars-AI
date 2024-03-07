import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const blendUrl = "https://api.goapi.ai/mj/v2/blend";

const handleBlend = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const useTurbo = body.useTurbo;

    if (!body.imageUrls || !body.dimension) {
      console.log("missing online image url or dimension");
      return NextResponse.json(
        { error: "missing online image url or dimension" },
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
        image_urls: body.imageUrls,
        dimension: body.dimension,
        notify_progress: true,
        process_mode: useTurbo ? "turbo" : "fast",
      },
      url: blendUrl,
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

export const POST = handleBlend;
