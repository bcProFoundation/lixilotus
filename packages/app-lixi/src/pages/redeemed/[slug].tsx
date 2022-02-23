import { ViewRedeemDto } from '@bcpros/lixi-models';
import LixiRedeemed from '@components/Redeem/LixiRedeemed';
import redeemApi from '@store/redeem/api';
import { SagaStore, wrapper } from '@store/store';
import { base62ToNumber, numberToBase62 } from '@utils/encryptionMethods';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';

const RedeemPage = (props) => {
  const { redeem } = props;
  const slug = numberToBase62(redeem.id);
  const canonicalUrl = `/redeemed/${slug}`;

  const imageUrl = redeem?.image
    ? process.env.NEXT_PUBLIC_LIXI_API + redeem?.image
    : process.env.NEXT_PUBLIC_LIXI_API + 'images/default.png';

  return (
    <>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'Open Graph Title',
          description: 'Open Graph Description',
          images: [
            { url: imageUrl },
          ],
          site_name: 'LixiLotus',
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image',
        }}
      />
      <LixiRedeemed redeem={redeem} />
    </>

  );
}

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) => async (context) => {
  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const slug: string = _.isArray(context.params.slug) ? context.params.slug[0] : context.params.slug;
  const redeemId: number = _.toSafeInteger(base62ToNumber(slug));

  const redeem: ViewRedeemDto = await redeemApi.getById(redeemId);

  return {
    props: {
      redeem
    }
  };
});

export default RedeemPage;
