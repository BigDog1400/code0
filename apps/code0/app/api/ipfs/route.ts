import { addComponentTemplate } from '@/app/_services/ipfs.service';
import { NextRequest } from 'next/server';

export const GET = async (
  req: NextRequest,
  { params }: { params: { url: string[] } },
) => {
  addComponentTemplate('idjjdjdj');

  return new Response('ok', {
    status: 200,
  });
};
