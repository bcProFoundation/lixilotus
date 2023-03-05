import { Burn } from '@bcpros/lixi-models';

export interface BurnState {
  burnQueue: Array<any>;
  latestBurnForPost: Burn;
  latestBurnForToken: Burn;
  latestBurnForPage: Burn;
}
