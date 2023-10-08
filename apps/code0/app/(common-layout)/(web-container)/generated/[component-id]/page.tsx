'use client'; // provitional, not now
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import ComponentPreview from '@/app/_components/preview-item';

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default function Page() {
  const [imagePreview, setImagePreview] = useState('');
  const [isImagePreviewLoading, setIsImagePreviewLoading] = useState(false);
  const { ['component-id']: componentId, componentVersion } = useParams();

  const getImagePreview = async () => {
    setIsImagePreviewLoading(true);
    if (!componentId || !componentVersion) {
      return;
    }
    try {
      const { data } = await axios.get<{ url: string }>(
        `/api/preview/${componentId}?componentVersion=${componentVersion}`,
      );
      setImagePreview(data.url);
    } catch (error) {
      console.log(error);
    } finally {
      setIsImagePreviewLoading(false);
    }
  };

  const components = [
    {
      prompt: 'A button component',
      id: '0',
    },
    {
      prompt: 'A table component',
      id: '1',
    },
    {
      prompt: 'A user profile component',
      id: '2',
    },
    {
      prompt: 'A navigation bar component',
      id: '3',
    },
    {
      prompt: 'A footer component',
      id: '4',
    },
    {
      prompt: 'A spotify player component',
      id: '5',
    },
    {
      prompt: 'A spotify player component',
      id: '6',
    },
    {
      prompt: 'A spotify player component',
      id: '7',
    },
    {
      prompt: 'A spotify player component',
      id: '8',
    },
    {
      prompt: 'A spotify player component',
      id: '9',
    }
  ]

  const [selectedItem, setSelectedItem] = useState<{ prompt: string, id: string } | null>(components[0]);
  const [scrollIndex, setScrollIndex] = useState<number>(0);

  useEffect(() => {
    if (selectedItem) {
      const selectedIndex = components.findIndex((item) => item.id === selectedItem.id);
      if (selectedIndex >= 2) {
        setScrollIndex(selectedIndex - 2);
      }
    }
  }, [selectedItem, components]);

  const handleItemClick = (item: { prompt: string, id: string }) => {
    setSelectedItem(item);
  };

  const visiblecomponents = useMemo(() => {
    const startIndex = Math.min(scrollIndex, components.length - 5);
    return components.slice(startIndex, startIndex + 5);
  }, [scrollIndex, components]);

  const handleScroll = (direction: 'up' | 'down') => {
    const scrollStep = direction === 'up' ? -1 : 1;
    const newScrollIndex = Math.min(
      Math.max(scrollIndex + scrollStep, 0),
      components.length - 5
    );
    setScrollIndex(newScrollIndex);
  };

  return (
    <>
      <div className="h-full min-w-[200px] flex flex-col justify-center px-4 absolute right-0">
        <div className='flex flex-col gap-2 transition-all snap-mandatory snap-y max-h-[532px] no-scrollbar'>
          {visiblecomponents.map((component, index) => (
            <ComponentPreview
              key={component.id}
              isSelected={selectedItem?.id === component.id}
              image="/api/preview/gateway/bafybeieprauiv2cdumlkoydzlnvmyqhbwh5vsprbf3igknsuhqqwbfkzlu/Macarena_Rivas_V._64f743b304c18cbae9964cbd__invitation.png"
              action={() => {
                handleItemClick(component);
              }}
              version={component.id}
              prompt={component.prompt}
            />
          ))}
        </div>
      </div>
    </>
  );
}
