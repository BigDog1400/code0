import clientPromise from "@/lib/database";
import { GeneratedComponentModel } from "@/app/_models/coponent";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { ["component-id"]: string } }
) => {
  await clientPromise;
  const componentId = params["component-id"];
  const components = await GeneratedComponentModel.find({
    componentId,
  });

  if (components.length === 0) {
    return new Response(JSON.stringify({ message: "Component not found" }), {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify(
      {
        ...components[0].toObject(),
        iterations: components.sort(),
      },
      null,
      2
    ),
    {
      status: 200,
    }
  );
};
