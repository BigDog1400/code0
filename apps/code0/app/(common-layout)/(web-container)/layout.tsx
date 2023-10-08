import { PromptIterationInputForm } from '@/app/_components/prompt-iteration-input-form';
import { WebContainerClient } from '@/app/_components/webcontainerClient';

export default function WebContainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="w-[79vw] h-[80vh] p-[14px] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl overflow-hidden relative">
          <div className="w-full h-full border-[2px] border-black/20 rounded-xl bg-white overflow-hidden">
            <WebContainerClient />
          </div>
          <PromptIterationInputForm />
        </div>
      </div>
    </div>
  );
}
