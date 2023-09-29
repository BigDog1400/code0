import axios from "axios";
import { Blob } from "@web-std/file";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { url: string[] } }
) => {
    
  const { data } = await axios.get(
    `https://w3s.link/ipfs/${params.url.join("/")}`,
    {
      responseType: "arraybuffer",
    }
  );

  const blob = new Blob([data, { type: "image/png" }]);

  return new Response(blob, {
    headers: {
      "content-type": "image/png",
      "content-length": String(blob.size),
    },
  });
};
