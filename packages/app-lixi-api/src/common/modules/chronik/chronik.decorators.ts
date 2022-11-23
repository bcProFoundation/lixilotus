import { Inject } from '@nestjs/common';
import { CHRONIK_CLIENTS } from './chronik.constants';

export function InjectChronikClient(network: string) {
  const token = `${CHRONIK_CLIENTS}_${network}`;
  return Inject(token);
}
