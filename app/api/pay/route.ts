import { generateOrderNumber, wxPaySign } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const payUrl = "https://api.ltzf.cn/api/wxpay/native";

const handlePay = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const payType = body.payType;
    console.log("payType", payType);

    const merchant_id = process.env.Merchant_ID || "";
    const merchant_key = process.env.Merchant_KEY || "";

    console.log(merchant_id, merchant_key);

    let fee = 0.1;
    let product_description = "";
    if (payType === "oneMonthPay") {
      // fee = 99;
      fee = 0.09;
      product_description = "infinityai一个月订阅";
    }
    if (payType === "threeMonthPay") {
      // fee = 297;
      fee = 0.29;
      product_description = "infinityai三个月订阅";
    }
    if (payType === "twelveMonthPay") {
      // fee = 999;
      fee = 0.99;
      product_description = "infinityai十二个月订阅";
    }
    if (payType === "twentyPay") {
      // fee = 24;
      fee = 0.02;
      product_description = "infinityai200积分";
    }
    if (payType === "fiftyPay") {
      // fee = 60;
      fee = 0.06;
      product_description = "infinityai500积分";
    }
    if (payType === "hundredPay") {
      // fee = 120;
      fee = 0.12;
      product_description = "infinityai1000积分";
    }
    console.log(fee);

    const orderId = generateOrderNumber();
    console.log("orderId", orderId);

    const callbackUrl = "https://infinityai.asia/api/payCallback";
    // const callbackUrl = "https://funny-friends-accept.loca.lt/api/payCallback";
    const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间的秒级时间戳
    const tenDigitTimestamp = timestamp.toString().substring(0, 10); // 提取前 10 位数
    const signParams = {
      mch_id: merchant_id, //商户号
      out_trade_no: orderId, //商户订单号
      total_fee: fee + "", //支付金额
      body: product_description, //商品描述
      timestamp: tenDigitTimestamp + "", //10位时间戳
      notify_url: callbackUrl, //支付通知url
    };
    const sign = wxPaySign(signParams, merchant_key);
    console.log("sign", sign);

    const data = `mch_id=${merchant_id}&out_trade_no=${orderId}&total_fee=${fee}&body=${product_description}&timestamp=${tenDigitTimestamp}&notify_url=${callbackUrl}&time_expire=5m&sign=${sign}`;

    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
      data,
      url: payUrl,
      method: "post",
    };

    const response = await axios(options);
    console.log(response.data);

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

export const POST = handlePay;
