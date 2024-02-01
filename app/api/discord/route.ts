import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const imagineUrl = "https://api.midjourneyapi.xyz/mj/v2/imagine";
const fetchUrl = "https://api.midjourneyapi.xyz/mj/v2/fetch";

const handler = async (req: NextRequest) => {
  try {
    const body = await req.json();

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
        "x-webhook-secret": process.env.WEBHOOK_SECRET,
      },
      data: {
        prompt: body.prompt,
        aspect_ratio: "",
        process_mode: "fast",
        notify_progress: true,
        webhook_secret: process.env.WEBHOOK_SECRET,
        webhook_endpoint:
          "https://webhook.site/5876ca8a-6406-40c7-acf2-f8ddc02922a4",
      },
      url: imagineUrl,
      method: "post",
    };

    const response = await axios(options);

    let imageData;

    if (response.data.status == "success") {
      const taskId = response.data.task_id;
      imageData = await axios.post(fetchUrl, { task_id: taskId });

      return NextResponse.json(imageData.data.task_result, {
        status: imageData.status,
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = handler;
