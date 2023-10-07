import { FileSystemTree } from '@webcontainer/api';
import { AllowedFramework } from '../_models/library';
import shadcnLucide from './react_shadcn_lucide.json';

type ITemplateMetadata = {
  [ket in AllowedFramework]: {
    name: string;
    template: FileSystemTree;
    specs: string[];
  }[];
};

export default {
  react: [
    { name: 'Shadcn + Lucide', template: shadcnLucide, specs: ['shadcn-ui'] },
  ],
  vue: [
    {
      name: 'Vue + Chakra',
      template: shadcnLucide,
      specs: ['chakra-ui-vue-next'],
    },
  ],
} as unknown as ITemplateMetadata;
