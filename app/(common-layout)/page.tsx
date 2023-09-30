import Link from 'next/link';

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
        <div className="flex items-center justify-center w-[40rem] h-16 gap-4">
          <div className="flex items-center justify-center w-12 h-12 text-xl text-gray-800  rounded-3xl">
            <span>🔍</span>
          </div>
          <input
            className="flex-1 h-12 px-4 text-lg font-bold text-gray-800 bg-gray-100 rounded-3xl"
            placeholder="A component that..."
          />
        </div>
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
