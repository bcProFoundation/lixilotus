import { createSelector } from "reselect";
import { RootState, store } from "../store";
import { redeemsAdapter } from "./reducer";
import { RedeemsState } from "./state";


const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = redeemsAdapter.getSelectors();

export const getAllRedeems = createSelector(
  (state: RootState) => state.redeems,
  selectAll
);

export const getAllRedeemsEntities = createSelector(
  (state: RootState) => state.redeems,
  selectEntities
);