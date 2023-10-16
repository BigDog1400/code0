import cx from 'classnames';
import Image from 'next/image';
export default function ComponentPreview({
  isSelected,
  image,
  action,
  prompt,
  version,
}: {
  image: string;
  prompt: string;
  action: () => void;
  isSelected?: boolean;
  version?: string;
}) {
  return (
    <div
      onClick={action}
      className={cx(
        'group w-full h-[100px] object-center snnap-center cursor-pointer rounded-xl relative transition-all border hover:border-blue-500 border-gray-200',
        {
          '!border-blue-500': isSelected,
        },
      )}
    >
      <div
        className={cx('w-full h-full rounded-xl relative overflow-hidden', {
          'shadow-inner': isSelected,
        })}
      >
        <Image
          className="object-cover max-w-[167px] max-h-[600px]"
          src={
            'https://pub-f60900e942d94fc3967b137c2cac6e50.r2.dev/chrome_3cwe8PlOVe.png'
          }
          alt="preview"
          width={167}
          height={98}
        />
      </div>
      <div className="invisible opacity-0 z-40 flex group-hover:opacity-100 group-hover:visible absolute right-[90%] group-hover:right-[105%] transition-all inset-y-0">
        <div className="p-4 my-auto shadow-md bg-gradient-to-r from-slate-50 to-slate-200 rounded-xl">
          <p className="text-sm text-gray-800 min-w-[200px]">{prompt}</p>
        </div>
      </div>
      <div className="absolute px-2 rounded-lg bottom-2 left-2 bg-gray-50">
        <p className="font-mono text-xs font-bold text-gray-500">v{version}</p>
      </div>
    </div>
  );
}
