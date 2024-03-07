/* prettier-ignore-file */
import { NextResponse } from "next/server";
import { supabaseCli } from "@/lib/supabase/supabaseClient";
import { getUserCredits, wxPaySign } from "@/lib/utils";

const handleCallback = async (req: Request) => {
  try {
    const payFormData = await req.formData();
    const mch_key = process.env.Merchant_KEY;
    const code = payFormData.get("code")?.toString() || "";
    const timestamp = payFormData.get("timestamp")?.toString() || "";
    const mch_id = payFormData.get("mch_id")?.toString() || "";
    const out_trade_no = payFormData.get("out_trade_no")?.toString() || "";
    const total_fee = payFormData.get("total_fee")?.toString() || "";
    const order_no = payFormData.get("order_no")?.toString() || "";
    const pay_no = payFormData.get("pay_no")?.toString() || "";

    const signData = {
      code,
      timestamp,
      mch_id,
      out_trade_no,
      total_fee,
      order_no,
      pay_no,
    };

    console.log(signData);

    let credits = 0;
    const sign = payFormData.get("sign")?.toString() || "";

    const email = payFormData.get("attach")?.toString();

    const signCallback = wxPaySign(signData, mch_key!);
    console.log(signCallback);

    if (total_fee === "0.09") {
      credits = 100;
    }
    if (total_fee === "0.29") {
      credits = 300;
    }
    if (total_fee === "0.99") {
      credits = 1200;
    }
    if (total_fee === "0.02") {
      credits = 200;
    }
    if (total_fee === "0.06") {
      credits = 500;
    }
    if (total_fee === "0.12") {
      credits = 1000;
    }

    let isAddCredits = false;
    if (sign === signCallback) {
      console.log("签名验证成功！");

      if (isAddCredits === false) {
        const supabase = supabaseCli();
        const oldCredits = await getUserCredits(email!);

        console.log(oldCredits);

        const res = await supabase
          .from("infinityai_352020833zsx_users")
          .update({
            infinityai_user_credits: oldCredits + credits,
          })
          .eq("email", email)
          .select();
        isAddCredits = true;
        console.log(res);
      }

      // prettier-ignore
      return NextResponse.json('SUCCESS', {
        status: 200,
      });
      // return NextResponse.json({
      //   message: "SUCCESS",
      //   status: 200,
      // });
    }
  } catch (error) {
    console.error(`Error: ${error}`);

    return NextResponse.json("FAIL", { status: 500 });
  }
};

export const POST = handleCallback;
