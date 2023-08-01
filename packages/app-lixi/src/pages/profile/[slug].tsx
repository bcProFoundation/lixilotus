import { PrismaClient } from '@bcpros/lixi-prisma';
import MainLayout from '@components/Layout/MainLayout';
import ProfileDetail from '@components/Profile/ProfileDetail';
import { useCheckIfFollowAccountQuery } from '@store/follow/follows.api';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';

const ProfileDetailPage = props => {
  const { userAddress, isMobile, accountAsString } = props;
  const account = JSON.parse(accountAsString);
  const { currentData: currentIsFollowedData, isSuccess: isSuccessCheckFollowed } = useCheckIfFollowAccountQuery({
    followingAccountId: account.id
  });

  let isFollowed;
  if (isSuccessCheckFollowed && currentIsFollowedData) {
    isFollowed = currentIsFollowedData.checkIfFollowAccount;
  }
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `profile/${userAddress}`;

  return (
    <>
      {isSuccessCheckFollowed && (
        <>
          <NextSeo
            title={account.name}
            description="The lixi program send you a small gift ."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'Lixi',
              images: [{ url: '' }],
              site_name: 'Lixi'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <ProfileDetail user={account} isMobile={isMobile} checkIsFollowed={isFollowed} />
        </>
      )}
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) => async context => {
  const { req } = context;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const { isMobile } = getSelectorsByUserAgent(userAgent);
  const prisma = new PrismaClient();

  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const slug: string = _.isArray(context.params.slug) ? context.params.slug[0] : context.params.slug;
  const userAddress: string = slug;

  const account = await prisma.account.findFirst({
    where: {
      address: userAddress
    },
    include: {
      avatar: {
        include: { upload: true }
      },
      cover: {
        include: { upload: true }
      }
    }
  });

  let followersCount = 0;
  let followingsCount = 0;
  let followingPagesCount = 0;
  const followingsCountPromise = prisma.followAccount.count({
    where: { followerAccountId: account.id }
  });
  const followersCountPromise = prisma.followAccount.count({
    where: { followingAccountId: account.id }
  });
  const followingPagesCountPromise = prisma.followPage.count({
    where: { accountId: account.id }
  });

  [followersCount, followingsCount, followingPagesCount] = await Promise.all([
    followersCountPromise,
    followingsCountPromise,
    followingPagesCountPromise
  ]);

  const result = {
    ...account,
    followersCount: followersCount,
    followingsCount: followingsCount,
    followingPagesCount: followingPagesCount
  }
  const accountAsString = JSON.stringify(result);

  return {
    props: {
      accountAsString,
      userAddress,
      isMobile
    }
  };
});

ProfileDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default ProfileDetailPage;
