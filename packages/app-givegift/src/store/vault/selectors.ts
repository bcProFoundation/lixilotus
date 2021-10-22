import { createSelector } from "reselect";
import { RootState } from "../rootReducer";
import { store } from "../store";
import { vaultsAdapter } from "./reducer";
import { VaultsState } from "./state";



const vaultsSelectors = vaultsAdapter.getSelectors<RootState>((state) => state.vaults);



const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = vaultsAdapter.getSelectors();

export const getAllVaults = createSelector(
  (state: RootState) => state.vaults,
  selectAll
)