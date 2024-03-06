import { wxPaySign } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const handleCallback = async (req: NextRequest) => {
  try {
    // const body = await req.json();
    // console.log(body);

    // const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间的秒级时间戳
    // const tenDigitTimestamp = timestamp.toString().substring(0, 10); // 提取前 10 位数
    // const signParams = {
    //   mch_id: merchant_id, //商户号
    //   out_trade_no: orderId, //商户订单号
    //   total_fee: fee + "", //支付金额
    //   body: product_description, //商品描述
    //   timestamp: tenDigitTimestamp + "", //10位时间戳
    //   notify_url: callbackUrl, //支付通知url
    // };

    return NextResponse.json("SUCCESS", {
      status: 200,
    });
  } catch (error) {
    console.error(`Error: ${error}`);

    return NextResponse.json("FAIL", { status: 500 });
  }
};

export const POST = handleCallback;
