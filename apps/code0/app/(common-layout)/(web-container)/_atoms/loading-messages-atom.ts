import { atom, useAtom } from 'jotai';

export const messages = [
  'Booting container',
  'Mounting file system',
  'Installing dependencies',
  'Starting dev server',
];

export const currentStateAtom = atom('');

export const useLoadingMessagesAtom = () => {
  return useAtom(currentStateAtom);
};
