import { EntityState } from "@reduxjs/toolkit";
import { Redeem, ViewRedeemDto } from "@abcpros/givegift-models";

export interface RedeemsState extends EntityState<Redeem> {
    currentAddress: string;
    currentRedeemCode: string;
    currentLixiRedeem?: ViewRedeemDto;
}