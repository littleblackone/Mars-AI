import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const fetchUrl = "https://api.midjourneyapi.xyz/mj/v2/fetch";
const handleFetch = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const taskId = body.taskId;

    if (taskId === "") {
      return NextResponse.json(
        { error: "taskId not provided" },
        { status: 400 }
      );
    }

    const taskResult = await axios.post(fetchUrl, { task_id: taskId });

    return NextResponse.json(taskResult.data, {
      status: taskResult.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = handleFetch;
