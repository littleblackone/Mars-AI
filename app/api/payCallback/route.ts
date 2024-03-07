import { UserData } from "@/lib/interface/ImageData";
import { supabaseCli } from "@/lib/supabase/supabaseClient";
import {
  convertTimestampToDateTime,
  getUserCredits,
  wxPaySign,
} from "@/lib/utils";

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
    let subscriptionType = "";

    const sign = payFormData.get("sign")?.toString() || "";

    const email = payFormData.get("attach")?.toString();

    const signCallback = wxPaySign(signData, mch_key!);

    let subscriptionExpiry;

    // 假设现在的时间戳为 currentTimestamp
    const currentTimestamp = Date.now();
    //circle time
    if (total_fee === "0.09") {
      credits = 1000;
      subscriptionType = "month";
      // 假设一个月是30天
      const expiryTimestamp = currentTimestamp + 30 * 24 * 60 * 60 * 1000;
      subscriptionExpiry = convertTimestampToDateTime(expiryTimestamp);
    }

    if (total_fee === "0.29") {
      credits = 3000;
      subscriptionType = "month";
      const expiryTimestamp = currentTimestamp + 30 * 3 * 24 * 60 * 60 * 1000;
      subscriptionExpiry = convertTimestampToDateTime(expiryTimestamp);
    }

    if (total_fee === "0.99") {
      credits = 12000;
      subscriptionType = "year";
      // 假设一年是365天
      const expiryTimestamp = currentTimestamp + 365 * 24 * 60 * 60 * 1000;
      subscriptionExpiry = convertTimestampToDateTime(expiryTimestamp);
    }

    //forever long
    if (total_fee === "0.02") {
      credits = 200;
      subscriptionType = "peruse";
      const expiryTimestamp = currentTimestamp + 365 * 10 * 24 * 60 * 60 * 1000;
      subscriptionExpiry = convertTimestampToDateTime(expiryTimestamp);
    }
    if (total_fee === "0.06") {
      credits = 500;
      subscriptionType = "peruse";
      const expiryTimestamp = currentTimestamp + 365 * 10 * 24 * 60 * 60 * 1000;
      subscriptionExpiry = convertTimestampToDateTime(expiryTimestamp);
    }
    if (total_fee === "0.12") {
      credits = 1000;
      subscriptionType = "peruse";
      const expiryTimestamp = currentTimestamp + 365 * 10 * 24 * 60 * 60 * 1000;
      subscriptionExpiry = convertTimestampToDateTime(expiryTimestamp);
    }

    const subscriptionStartAt = convertTimestampToDateTime(Date.now());

    if (sign === signCallback) {
      const supabase = supabaseCli();
      const oldCredits = await getUserCredits(email!);

      const res = await supabase
        .from("infinityai_352020833zsx_users")
        .select()
        .eq("email", email);

      const realData: UserData = res.data && res.data[0];
      const userOrderID = realData.user_order_id;

      if (
        userOrderID === "" ||
        (userOrderID !== "" && userOrderID !== out_trade_no)
      ) {
        await supabase
          .from("infinityai_352020833zsx_users")
          .update({
            infinityai_user_credits: oldCredits + credits,
            subscription_type: subscriptionType,
            subscription_startAt: subscriptionStartAt,
            subscription_expiry: subscriptionExpiry,
            user_order_id: out_trade_no,
          })
          .eq("email", email)
          .select();
      }

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
  }
  //不能加finally
};

export const POST = handleCallback;
