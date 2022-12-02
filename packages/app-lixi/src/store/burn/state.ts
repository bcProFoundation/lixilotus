import { Burn } from '@bcpros/lixi-models';

export interface BurnState {
  latestBurnForPost: Burn;
  latestBurnForToken: Burn;
  latestBurnForPage: Burn;
}
