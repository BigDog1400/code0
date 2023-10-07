import { WebContainer } from '@webcontainer/api';

declare global {
  interface Window {
    webContainer?: WebContainer;
  }
}
