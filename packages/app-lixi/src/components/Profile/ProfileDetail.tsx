import { CameraOutlined, CompassOutlined, EditOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import PostListItem from '@components/Posts/PostListItem';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
import { Button, Space, Tabs } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import styled from 'styled-components';

type PageDetailProps = {
  page: any;
  isMobile: boolean;
};

const StyledContainerProfileDetail = styled.div`
  background: var(--bg-color-light-theme);
  border-radius: 20px;
  .reaction-container {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border: 1px solid #c5c5c5;
    border-left: 0;
    border-right: 0;
  }

  .comment-item-meta {
    margin-bottom: 0.5rem;
    .ant-list-item-meta-avatar {
      margin-top: 3%;
    }
    .ant-list-item-meta-title {
      margin-bottom: 0.5rem;
    }
  }

  .input-comment {
    padding: 1rem 0 0 0;
  }
`;

const ProfileCardHeader = styled.div`
  .cover-img {
    width: 100%;
    height: 350px;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;
    @media (max-width: 768px) {
      border-radius: 0;
      height: 200px;
    }
  }
  .info-profile {
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: end;
    padding: 1rem 2rem 1rem 0;
    background: #fff;
    .wrapper-avatar {
      left: 2rem;
      top: -90px;
      position: absolute;
      padding: 5px;
      background: #fff;
      border-radius: 50%;
      .avatar-img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
      }
      @media (max-width: 768px) {
        left: auto;
      }
      .btn-upload-avatar {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 35px;
        height: 35px;
        position: absolute;
        border-radius: 50%;
        bottom: 5%;
        right: 5%;
        background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
        .anticon {
          font-size: 20px;
          color: var(--color-primary);
        }
      }
    }
    .title-profile {
      margin-left: calc(160px + 48px);
      text-align: left;
      @media (max-width: 768px) {
        margin-left: 0;
        margin-top: 4rem;
        text-align: center;
      }
    }
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      padding-right: 0;
    }
  }
`;

const ProfileContentContainer = styled.div`
  display: flex;
  gap: 1rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LegacyProfile = styled.div`
  max-width: 35%;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const AboutBox = styled.div`
  background: #ffffff;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  border-radius: 24px;
  margin-bottom: 1rem;
  padding: 24px;
  h3 {
    text-align: left;
  }
  .about-content {
    padding: 1rem 0;
    text-align: left;
    display: flex;
    flex-direction: column;
  }
`;

const PictureBox = styled.div`
  background: #ffffff;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  border-radius: 24px;
  margin-bottom: 1rem;
  padding: 24px;
  h3 {
    text-align: left;
  }
  .picture-content {
    padding: 1rem 0;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 10px;
    img {
      width: 110px;
      height: 110px;
      @media (max-width: 768px) {
        width: 95%;
      }
    }
  }
`;

const FriendBox = styled.div`
  background: #ffffff;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  border-radius: 24px;
  margin-bottom: 1rem;
  padding: 24px;
  h3 {
    text-align: left;
  }
  .friend-content {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-column-gaps: 10px;
    grid-row-gap: 1rem;
    padding: 1rem 0;
    .friend-item {
      img {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        @media (max-width: 768px) {
          width: 95%;
        }
      }
      p {
        margin: 0;
        color: #4e444b;
        letter-spacing: 0.4px;
        font-size: 12px;
        line-height: 24px;
        width: 110px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
      }
    }
  }
`;

const ContentTimeline = styled.div`
  width: 100%;
`;

const Timeline = styled.div`
  border-radius: 24px;
  width: 100%;
  margin-right: 1rem;
  margin-bottom: 1rem;
  .time-line-blank {
    width: 100%;
  }
`;

const StyledSpace = styled(Space)`
  margin-bottom: 1rem;
  .ant-space-item {
    height: 18px;
    .anticon {
      font-size: 18px;
      color: rgba(30, 26, 29, 0.38);
    }
  }
`;

const StyledMenu = styled(Tabs)`
  .ant-tabs-nav {
    box-shadow: rgb(0 0 0 / 5%) 0px 2px 10px;
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 1rem 24px;
    border-top: 1px solid rgba(128, 116, 124, 0.12);
    background: white;
    border-bottom: 0;
  }
  .ant-tabs-tabpane {
    gap: 1rem;
    display: flex;
    flex-direction: row;
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  &.ant-tabs {
    width: 100vw;
  }
  .ant-tabs-nav {
    &::before {
      content: none;
    }
  }
`;

const SubAbout = ({
  icon,
  text,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  text?: string;
  dataItem?: any;
  imgUrl?: string;
  onClickIcon: () => void;
}) => (
  <StyledSpace onClick={onClickIcon}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl }, null)}
    {text}
  </StyledSpace>
);

const ProfileDetail = ({ page, isMobile }: PageDetailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const [pageDetailData, setPageDetailData] = useState<any>(page);
  const [listsFriend, setListsFriend] = useState<any>([]);
  const [listsPicture, setListsPicture] = useState<any>([]);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByPageIdQuery(
    {
      first: 10,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      },
      id: page.id
    },
    false
  );

  useEffect(() => {
    fetchListFriend();
  }, []);

  useEffect(() => {
    fetchListPicture();
  }, []);

  useEffect(() => {
    refetch();
  }, []);

  const fetchListFriend = () => {
    return axios
      .get('https://picsum.photos/v2/list?page=1&limit=10', {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
      .then(response => {
        setListsFriend(response.data);
      });
  };

  const fetchListPicture = () => {
    return axios
      .get('https://picsum.photos/v2/list?page=2&limit=20', {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
      .then(response => {
        setListsPicture(response.data);
      });
  };

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  return (
    <>
      <StyledContainerProfileDetail>
        <ProfileCardHeader>
          <div className="container-img">
            <img className="cover-img" src={pageDetailData.cover || '/images/default-cover.jpg'} alt="" />
          </div>
          <div className="info-profile">
            <div className="wrapper-avatar">
              <picture>
                <img className="avatar-img" src={pageDetailData.avatar || '/images/default-avatar.jpg'} alt="" />
              </picture>
              <div className="btn-upload-avatar">
                <CameraOutlined />
              </div>
            </div>
            <div className="title-profile">
              <h3>{pageDetailData.name}</h3>
              <p>{pageDetailData.title}</p>
            </div>
            <div>
              <Button style={{ marginRight: '1rem' }} type="primary" className="outline-btn">
                <EditOutlined />
                Edit profile
              </Button>
              <Button type="primary" className="outline-btn">
                <CameraOutlined />
                Edit cover photo
              </Button>
            </div>
          </div>
        </ProfileCardHeader>
        <ProfileContentContainer>
          <StyledMenu defaultActiveKey="post">
            <Tabs.TabPane tab="Post" key="post">
              <LegacyProfile>
                <AboutBox>
                  <h3>About</h3>
                  {pageDetailData && !pageDetailData.description && (
                    <div className="blank-about">
                      <img src="/images/about-blank.svg" alt="" />
                      <p>Let people know more about you (description, hobbies, address...</p>
                      <Button type="primary" className="outline-btn">
                        Update info
                      </Button>
                    </div>
                  )}
                  <div className="about-content">
                    <SubAbout
                      dataItem={pageDetailData?.description}
                      onClickIcon={() => {}}
                      icon={InfoCircleOutlined}
                      text={pageDetailData?.description}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.address}
                      onClickIcon={() => {}}
                      icon={CompassOutlined}
                      text={pageDetailData?.address}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.website}
                      onClickIcon={() => {}}
                      icon={HomeOutlined}
                      text={pageDetailData?.website}
                    />
                    <Button type="primary" className="outline-btn">
                      Edit your profile
                    </Button>
                  </div>
                </AboutBox>
                <PictureBox>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Pictures</h3>
                    {listsPicture && listsPicture.length > 0 && (
                      <Button type="primary" className="no-border-btn" style={{ padding: '0' }}>
                        See all
                      </Button>
                    )}
                  </div>
                  {listsPicture && listsPicture.length < 0 && (
                    <div className="blank-picture">
                      <img src="/images/photo-blank.svg" alt="" />
                      <p>Photos uploaded in posts, or posts that have tag of your name</p>
                      <Button type="primary" className="outline-btn">
                        Update picture
                      </Button>
                    </div>
                  )}
                  <div className="picture-content">
                    {listsPicture &&
                      listsPicture.length > 0 &&
                      listsPicture.map((item: any, index: number) => {
                        if (index < 9) return <img key={item.id} src={item.download_url} alt={item.author} />;
                      })}
                  </div>
                </PictureBox>
                <FriendBox>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3>Friends</h3>
                      <p
                        style={{
                          margin: '0',
                          fontSize: '13px',
                          letterSpacing: '0.5px',
                          color: 'rgba(30, 26, 29, 0.6)'
                        }}
                      >
                        {listsFriend.length > 0 ? listsFriend.length + ' friends' : ''}
                      </p>
                    </div>
                    {listsFriend && listsFriend.length > 0 && (
                      <Button type="primary" className="no-border-btn" style={{ padding: '0' }}>
                        See all
                      </Button>
                    )}
                  </div>
                  {listsFriend && listsFriend.length < 0 && (
                    <div className="blank-friend">
                      <img src="/images/friend-blank.svg" alt="" />
                      <p>Connect with people you know in LixiLotus.</p>
                      <Button type="primary" className="outline-btn">
                        Discover LixiLotus social network
                      </Button>
                    </div>
                  )}
                  {listsFriend && listsFriend.length > 0 && (
                    <div className="friend-content">
                      {listsFriend.map((item: any, index: number) => {
                        if (index < 9)
                          return (
                            <div key={item.id} className="friend-item">
                              <img src={item.download_url} alt="" />
                              <p>{item.author}</p>
                            </div>
                          );
                      })}
                    </div>
                  )}
                </FriendBox>
              </LegacyProfile>
              <ContentTimeline>
                <SearchBox />
                <CreatePostCard pageId={page.id} refetch={() => refetch()} />
                <Timeline>
                  {/* <div className="blank-timeline">
                <img className="time-line-blank" src="/images/time-line-blank.svg" alt="" />
                <p>Sharing your thinking</p>
                <Button type="primary">Create your post</Button>
              </div> */}
                  <div className={'listing'} style={{ height: '100vh' }}>
                    <Virtuoso
                      className={'listing'}
                      style={{ height: '100%' }}
                      data={data}
                      endReached={loadMoreItems}
                      overscan={900}
                      itemContent={(index, item) => {
                        return <PostListItem index={index} item={item} />;
                      }}
                      totalCount={totalCount}
                      components={{
                        Footer: () => {
                          return (
                            <div
                              style={{
                                padding: '1rem',
                                textAlign: 'center'
                              }}
                            >
                              end reached
                            </div>
                          );
                        }
                      }}
                    />
                  </div>
                </Timeline>
              </ContentTimeline>
            </Tabs.TabPane>
            <Tabs.TabPane tab="About" key="about"></Tabs.TabPane>
            <Tabs.TabPane tab="Friend" key="friend"></Tabs.TabPane>
            <Tabs.TabPane tab="Picture" key="picture"></Tabs.TabPane>
          </StyledMenu>
        </ProfileContentContainer>
      </StyledContainerProfileDetail>
    </>
  );
};

export default ProfileDetail;
