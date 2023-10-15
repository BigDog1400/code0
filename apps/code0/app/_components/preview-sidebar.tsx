'use client';
import React from 'react';
import { GeneratedComponentMetadata } from '../_models/component';
import ComponentPreview from './preview-item';
import { useParams, useRouter } from 'next/navigation';

interface PreviewSidebarProps {
  componentsData: GeneratedComponentMetadata;
  componentId: string;
}

export function PreviewSidebar(props: PreviewSidebarProps) {
  console.log(props);
  const router = useRouter();

  return (
    <div className="h-full min-w-[200px] flex flex-col justify-center px-4 absolute right-0">
      <div className="flex flex-col gap-2 transition-all snap-mandatory snap-y max-h-[532px] no-scrollbar">
        {props.componentsData.iterations.map((component, index) => (
          <ComponentPreview
            key={component._id}
            isSelected={true}
            image="/api/preview/gateway/bafybeieprauiv2cdumlkoydzlnvmyqhbwh5vsprbf3igknsuhqqwbfkzlu/Macarena_Rivas_V._64f743b304c18cbae9964cbd__invitation.png"
            action={() => {
              router.push(
                `/generated/${props.componentId}?version=${component.version}`,
              );
            }}
            version={String(component.version)}
            prompt={component.prompt}
          />
        ))}
      </div>
    </div>
  );
}
