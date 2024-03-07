import { NextResponse } from "next/server";
import { supabaseCli } from "@/lib/supabase/supabaseClient";
import { getUserCredits, wxPaySign } from "@/lib/utils";
import { redirect } from "next/navigation";

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

    if (sign === signCallback) {
      const supabase = supabaseCli();
      const oldCredits = await getUserCredits(email!);

      await supabase
        .from("infinityai_352020833zsx_users")
        .update({
          infinityai_user_credits: oldCredits + credits,
        })
        .eq("email", email)
        .select();

      return new Response("SUCCESS", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);

    return new Response("FAIL", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } finally {
    redirect("/create");
  }
};

export const POST = handleCallback;
