import { WebContainer } from '@webcontainer/api';
import { atom, useAtom } from 'jotai';

export const webContainer = atom<WebContainer | null>(null);

export const useWebContainer = () => {
  const _webContainer = useAtom(webContainer);
  return _webContainer;
};
