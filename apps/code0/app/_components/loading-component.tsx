import { Loader } from 'lucide-react';
import {
  messages,
  useLoadingMessagesAtom,
} from '../(common-layout)/(web-container)/_atoms/loading-messages-atom';
import { useEffect, useState } from 'react';
import cx from 'classnames';
import 'animate.css';

/**
 * A component that displays a loading spinner and a loading message.
 * @returns The Loading component.
 */
export default function Loading() {
  const [loadingMessage] = useLoadingMessagesAtom();
  const [staleText, setStaleText] = useState('');
  const [animationState, setAnimationState] = useState<0 | 1>(0);
  const [isHidden, setIsHidden] = useState(false);

  /**
   * A side effect that updates the loading message and triggers a fade-in animation.
   */
  useEffect(() => {
    // setAnimationState(0), setAnimationState(1);
    if (loadingMessage) {
      setAnimationState(0);
      setTimeout(() => {
        setStaleText(loadingMessage);
        setAnimationState(1);

        if (loadingMessage == messages[messages.length - 1]) {
          setIsHidden(true);
        }
      }, 100);
    }
  }, [loadingMessage]);

  /**
   * Renders the Loading component.
   */

  console.log({ staleText });
  return (
    <>
      {!isHidden && (
        <main className="flex flex-col items-center justify-center h-full w-full absolute z-10">
          <Loader className="animate-spin-slow absolute" />
          <div
            className={cx(
              'flex flex-row text-xs items-center opacity-0 justify-center h-6 gap-4 px-4 py-2 mt-20 rounded-3xl shadow-md bg-gradient-to-b from-gray-100 to-gray-200 animate__animated',
              {
                'animate__fadeInUp opacity-1': animationState === 1,
              },
            )}
          >
            {loadingMessage}
          </div>
        </main>
      )}
    </>
  );
}
