'use client';
// @ts-ignore // experimental_useFormState is not yet available in the typings, we are bleeding edge here :)
import { experimental_useFormState as useFormState } from 'react-dom';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { processIterationPrompt } from '../_actions/iteration';
import { SearchCode, Sparkles } from 'lucide-react';
import { useLoadingMessagesAtom } from '../(common-layout)/(web-container)/_atoms/loading-messages-atom';
import { useParams } from 'next/navigation';

const initialState = {
  message: '',
  template: 'Shadcn + Lucide',
  framework: 'react',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
      <span role="img" aria-label="Submit">
        {pending ? '⏳' : <Sparkles className="text-gray-600" />}
      </span>
    </button>
  );
}

export function PromptIterationInputForm() {
  const [state, formAction] = useFormState(
    processIterationPrompt,
    initialState,
  );
  const params = useParams();
  const [loadingMessage] = useLoadingMessagesAtom();

  return (
    <form
      action={formAction}
      className="absolute bottom-10 transform -translate-x-1/2 left-1/2"
    >
      <div
        className="flex flex-row items-center justify-center w-[40rem] h-12 gap-4 p-4  rounded-3xl shadow-md
        bg-gradient-to-b from-gray-100 to-gray-200
      "
      >
        <div className="flex items-center justify-center w-8 h-12 text-xl text-gray-800 rounded-3xl">
          <span>
            <SearchCode className="text-gray-600" />
          </span>
        </div>
        <div className="flex items-center w-full h-12  text-lg font-bold text-gray-800 rounded-3xl">
          <input
            placeholder="Update the component to..."
            className="flex-1 h-full bg-transparent outline-none"
            type="text"
            name="prompt"
            autoComplete="off"
          />
          <input
            type="hidden"
            name="generationId"
            value={params['component-id']}
          />
          <SubmitButton />
        </div>
      </div>

      <div
        className={`flex flex-row items-center w-[40rem] justify-center h-6 gap-4 p-4 mt-2 rounded-3xl shadow-md bg-gradient-to-b from-gray-100 to-gray-200 ${
          state?.message ? '' : 'hidden'
        }`}
      >
        <p aria-live="polite" role="status" className="text-sm text-gray-800">
          {state?.message}
        </p>
      </div>
    </form>
  );
}
