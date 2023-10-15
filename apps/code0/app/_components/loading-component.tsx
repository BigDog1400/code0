import { Loader } from 'lucide-react';
import {
  messages,
  useLoadingMessagesAtom,
} from '../(common-layout)/(web-container)/_atoms/loading-messages-atom';
import { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import 'animate.css';

/**
 * A component that displays a loading spinner and a loading message.
 * @returns The Loading component.
 */
export default function Loading() {
  const [loadingMessage] = useLoadingMessagesAtom();
  const [isHidden, setIsHidden] = useState(false);

  /**
   * A memoized value that calculates the stale text and animation state.
   */
  const staleText = useMemo(() => {
    if (!loadingMessage) {
      return '';
    }

    const isLastMessage = loadingMessage === messages[messages.length - 1];
    const staleText = isLastMessage ? '' : loadingMessage;
    return staleText;
  }, [loadingMessage]);

  /**
   * A side effect that sets the isHidden state when the last message is displayed.
   */
  useEffect(() => {
    // update to -1 when we add the postMessage event to the iframe
    if (loadingMessage === messages[messages.length - 2]) {
      setIsHidden(true);
    }
  }, [loadingMessage]);

  /**
   * Renders the Loading component.
   */

  return (
    <>
      {!isHidden && (
        <main className="absolute z-10 flex flex-col items-center justify-center w-full h-full">
          <Loader className="absolute animate-spin-slow" />
          {staleText && <LoadingComponent text={staleText} key={staleText} />}
        </main>
      )}
    </>
  );
}

interface LoadingComponentProps {
  text: string;
}

export function LoadingComponent({ text }: LoadingComponentProps) {
  return (
    <div className="flex flex-row items-center justify-center h-6 gap-4 px-4 py-2 mt-20 text-xs shadow-md opacity-0 rounded-3xl bg-gradient-to-b from-gray-100 to-gray-200 animate__animated animate__fadeInUp">
      {text}
    </div>
  );
}
