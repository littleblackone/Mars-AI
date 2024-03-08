import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const imagineUrl = "https://api.goapi.ai/mj/v2/imagine";

const handleImagine = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const useTurbo = body.useTurbo;
    if (!body.prompt) {
      console.log("Please enter the prompt");
      return NextResponse.json(
        { error: "Please enter the prompt" },
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
        prompt: body.prompt,
        aspect_ratio: "",
        process_mode: useTurbo ? "turbo" : "fast",
        notify_progress: true,
        skip_prompt_check: true,
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

export const POST = handleImagine;
