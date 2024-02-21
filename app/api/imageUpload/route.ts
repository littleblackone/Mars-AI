// import axios from "axios";
// import { NextRequest, NextResponse } from "next/server";

// const imageUploadUrl = "https://api.imgbb.com/1/upload";

// const handleUploadImage = async (req: NextRequest) => {
//   try {
//     const body = await req.formData();
//     console.log(body);

//     if (!body.imageFile) {
//       console.log("missing imageFile");
//       return NextResponse.json(
//         { error: "missing imageFile" },
//         {
//           status: 400,
//         }
//       );
//     }

//     const formData = new FormData();
//     formData.append("image", body.imageFile);

//     const options = {
//       headers: { "Content-Type": "multipart/form-data" },
//       params: {
//         key: process.env.IMGBB_KEY,
//       },
//     };

//     // const response = await axios(options);
//     const response = await axios.post(imageUploadUrl, formData, options);

//     return NextResponse.json(response.data, {
//       status: response.status,
//     });
//   } catch (error) {
//     // console.log(error);

//     console.error(`Error: ${error}`);

//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// };

// export const POST = handleUploadImage;
