import { NextRequest } from 'next/server';
import { getComponentIterationsById } from '@/app/_services/generated-component.service';

export const GET = async (
  _: NextRequest,
  { params }: { params: { ['component-id']: string } },
) => {
  const componentId = params['component-id'];
  const component = await getComponentIterationsById(componentId);
  return new Response(
    JSON.stringify(
      component,
      null,
      2,
    ),
    {
      status: 200,
    },
  );
};
