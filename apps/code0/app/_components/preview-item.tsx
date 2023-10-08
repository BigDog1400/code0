import cx from 'classnames';
export default function ComponentPreview({
  isSelected,
  image,
  action,
  prompt,
}: {
  image: string;
  prompt: string;
  action: () => void;
  isSelected?: boolean;
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
      <div className={cx("w-full h-full rounded-xl relative overflow-hidden", {
        'shadow-inner': isSelected
      })}>
        <img
          className="object-cover max-w-[167px] max-h-[600px]"
          src={image}
          alt="preview"
        />
      </div>
      <div className="invisible opacity-0 z-40 flex group-hover:opacity-100 group-hover:visible absolute right-[90%] group-hover:right-[105%] transition-all inset-y-0">
        <div className="bg-gradient-to-r p-4 from-slate-50 my-auto to-slate-200 rounded-xl shadow-md">
          <p className="text-sm text-gray-800 min-w-[200px]">{prompt}</p>
        </div>
      </div>
    </div>
  );
}
