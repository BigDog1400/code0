import { generateComponentPreview } from "@/app/_services/images.service";
import { NextRequest } from "next/server";

type ResponseData = {
  url: string;
};

export const GET = async (
  req: NextRequest,
  { params }: { params: { ["component-id"]: string } }
): Promise<Response> => {
  const url = await generateComponentPreview(
    params["component-id"] as string,
    (req.nextUrl.searchParams.get("componentVersion") &&
      parseInt(req.nextUrl.searchParams.get("componentVersion")!)) ||
      undefined
  );

  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  })
};
