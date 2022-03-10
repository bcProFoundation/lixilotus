import { EntityState } from "@reduxjs/toolkit";
import { Claim, ViewClaimDto } from "@bcpros/lixi-models";

export interface ClaimsState extends EntityState<Claim> {
    currentAddress: string;
    currentClaimCode: string;
    currentLixiClaim?: Nullable<ViewClaimDto>;
}