import PageDetail from '@components/Pages/PageDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import accountApi from '@store/account/api';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import ProfileDetail from '@components/Profile/ProfileDetail';
import { usePageQuery } from '@store/page/pages.generated';
import { AccountDto } from '@bcpros/lixi-models/src';
import { useGetAccountViaAddressQuery } from '@store/account/accounts.api';

const ProfileDetailPage = props => {
  const { userAddress, isMobile } = props;
  const { currentData, isSuccess } = useGetAccountViaAddressQuery({ address: userAddress });

  let user;
  if (isSuccess) user = currentData.getAccountViaAddress;
  console.log('user: ', user);
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `profile/${userAddress}`;

  return (
    <>
      {isSuccess && (
        <>
          <NextSeo
            title="Lixi Program"
            description="The lixi program send you a small gift ."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'LixiLotus',
              images: [{ url: '' }],
              site_name: 'LixiLotus'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <ProfileDetail user={user} isMobile={isMobile} />
        </>
      )}
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
  const userAddress: string = slug;

  return {
    props: {
      userAddress,
      isMobile
    }
  };
});

ProfileDetailPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default ProfileDetailPage;
