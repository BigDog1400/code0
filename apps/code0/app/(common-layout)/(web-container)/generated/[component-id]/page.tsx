import { PreviewSidebar } from '@/app/_components/preview-sidebar';
import { getComponentIterationsById } from '@/app/_services/generated-component.service';

export default async function Page({
  params,
  searchParams,
}: {
  params: { ['component-id']: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { ['component-id']: componentId } = params;
  const data = await getComponentIterationsById(componentId as string);

  return (
    <>
      <PreviewSidebar componentsData={data} componentId={componentId} />
    </>
  );
}
