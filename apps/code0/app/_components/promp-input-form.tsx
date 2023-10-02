'use client';
// @ts-ignore // experimental_useFormState is not yet available in the typings, we are bleeding edge here :)
import { experimental_useFormState as useFormState } from 'react-dom';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { processPrompt } from '@/app/_actions/prompts';

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
        {pending ? '⏳' : '✨'}
      </span>
    </button>
  );
}

export function PromptInputForm() {
  const [state, formAction] = useFormState(processPrompt, initialState);

  return (
    <form className="" action={formAction}>
      <div className="flex flex-row items-center justify-center w-[40rem] h-12 gap-4 p-4 bg-gray-100 rounded-3xl">
        <div className="flex items-center justify-center w-8 h-12 text-xl text-gray-800 rounded-3xl">
          <span>🔍</span>
        </div>
        <div className="flex items-center w-full h-12  text-lg font-bold text-gray-800 rounded-3xl">
          <input
            placeholder="A component that..."
            className="flex-1 h-full bg-transparent outline-none"
            type="text"
            name="prompt"
          />
          <input type="text" name="template" hidden value="Vue + Chakra" />
          <input type="text" name="framework" hidden value="vue" />
          <SubmitButton />
        </div>
      </div>
      <p aria-live="polite" role="status" className="text-red-500 mt-2">
        {state?.message}
      </p>
    </form>
  );
}
