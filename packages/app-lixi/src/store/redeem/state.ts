import { EntityState } from "@reduxjs/toolkit";
import { Redeem, ViewRedeemDto } from "@bcpros/lixi-models";

export interface RedeemsState extends EntityState<Redeem> {
    currentAddress: string;
    currentRedeemCode: string;
}