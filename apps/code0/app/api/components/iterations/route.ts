import clientPromise from '@/lib/database';
import { GeneratedComponentModel } from '@/app/_models/component';

export const GET = async () => {
  await clientPromise;
  const components = await GeneratedComponentModel.find();
  const formattedIterations = components
    .filter((component, index, array) => {
      return (
        index ===
        array.findIndex((c) => c.componentId === component.componentId)
      );
    })
    .map((component) => {
      return {
        ...component.toObject(),
        iterations: components
          .filter((iteration) => {
            return iteration.componentId === component.componentId;
          })
          .sort(),
      };
    });
  return new Response(JSON.stringify(formattedIterations, null, 2), {
    status: 200,
  });
};
