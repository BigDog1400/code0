import Link from 'next/link';
import { PromptInputForm } from '../_components/promp-input-form';

const FAKE_COMPONENTS_DATA = [
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
];

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center w-full h-72 gap-4">
        <PromptInputForm />
      </div>

      <div className="grid grid-cols-3 gap-8">
        {FAKE_COMPONENTS_DATA.map((component, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-between p-2 rounded-md"
          >
            <Link href={`/generated/${component.id}`}>
              <div className="w-72 h-72 bg-gray-200 rounded-md"></div>
            </Link>
            <div className="flex items-center justify-center w-72 h-10 mt-4 gap-2">
              <div className="h-10 bg-gray-200 rounded-full w-10"></div>
              <div className="flex items-center justify-center flex-1 h-10  text-sm font-bold text-center text-gray-800 bg-gray-200 rounded-md">
                {component.prompt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
