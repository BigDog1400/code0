import { FC } from 'react';

export interface IComponent {
  name: string;
  code: string;
  generationId: string;
  slug: string;
  prompt: string;
  timestamp: string;
  version: string;
  extension: string;
  iterations: string;
  framework: string;
  libraries: string[];
}

// export default {} as IComponent;
export default {} as Array<{
  name: FC;
  version: string;
}>;
