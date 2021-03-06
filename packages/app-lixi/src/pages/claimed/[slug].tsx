import { ViewClaimDto } from '@bcpros/lixi-models';
import LixiClaimed from '@components/Claim/LixiClaimed';
import claimApi from '@store/claim/api';
import { SagaStore, wrapper } from '@store/store';
import { base58ToNumber, numberToBase58 } from '@utils/encryptionMethods';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import ClaimedLayout from '@components/Layout/ClaimedLayout';

const ClaimPage = props => {
  const { claim, isMobile } = props;
  const slug = numberToBase58(claim.id);
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `claimed/${slug}`;

  const imageUrl = claim?.image
    ? process.env.NEXT_PUBLIC_LIXI_API + 'api/' + claim?.image
    : process.env.NEXT_PUBLIC_LIXI_API + 'api/images/default.png';

  return (
    <>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'LixiLotus',
          description: claim.message ?? 'LixiLotus allow you to giveaway your Lotus effortlessly',
          images: [{ url: imageUrl }],
          site_name: 'LixiLotus'
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image'
        }}
      />
      <LixiClaimed claim={claim} isMobile={isMobile} />
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) => async context => {
  const { req } = context;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const { isMobile } = getSelectorsByUserAgent(userAgent);

  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const slug: string = _.isArray(context.params.slug) ? context.params.slug[0] : context.params.slug;
  const claimId: number = _.toSafeInteger(base58ToNumber(slug));

  const claim: ViewClaimDto = await claimApi.getById(claimId);

  return {
    props: {
      claim,
      isMobile
    }
  };
});

ClaimPage.Layout = ({ children }) => <ClaimedLayout children={children} />;

export default ClaimPage;
