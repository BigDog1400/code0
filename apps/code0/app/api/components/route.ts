import clientPromise from '@/lib/database';
import { GeneratedComponentModel } from '@/app/_models/component';

export const GET = async () => {
  await clientPromise;
  const components = await GeneratedComponentModel.find();
  return new Response(JSON.stringify(components, null, 2), {
    status: 200,
  });
};
