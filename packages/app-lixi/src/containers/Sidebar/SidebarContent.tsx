import { OrderDirection, PostOrderField } from '@generated/types.generated';
import { getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getFilterPostsHome, getNavCollapsed } from '@store/settings/selectors';
import { push } from 'connected-next-router';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ItemQuickAccess, ShortCutItem } from './SideBarShortcut';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { setSelectedPost } from '@store/post/actions';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: Function;
};

const ContainerSideBarContent = styled.div`
  height: 100%;
  text-align: left;
  margin: 1rem 0;
  .wrapper {
    padding-bottom: 5rem;
    h3 {
      margin-bottom: 1rem !important;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .item-quick-access {
      width: 100%;
      gap: 8px !important;
      padding: 0 8px;
      border: 1px solid var(--border-color-base);
      cursor: pointer;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      .icon-quick-item {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 25px;
          height: 25px;
        }
      }
      .title-item {
        font-size: 14px;
        font-weight: 500;
      }
      &:hover {
        border-color: var(--color-primary);
        img {
          filter: var(--filter-color-primary) !important;
        }
        .title-item {
          color: var(--color-primary);
        }
      }
    }
  }
`;

const SidebarContent = ({ className }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isCollapse, setIsCollapse] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);
  const currentPathName = router.pathname ?? '';
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [filterGroup, setFilterGroup] = useState([]);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext } = useInfinitePostsQuery(
    {
      first: 50,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ]
    },
    false
  );

  const handleOnClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  const handleIconClick = (newPath?: string) => {
    dispatch(push(newPath));
  };

  useEffect(() => {
    const newArrFilter = _.uniqBy(data, item => {
      return item?.page?.id || item?.token?.tokenId || item?.postAccount.address;
    });
    setFilterGroup([...newArrFilter]);
  }, [data]);

  const pathShortcutItem = (item, path) => {
    let fullPath = '';
    if (item?.page) {
      return (fullPath = `/page/${path}`);
    }
    if (item?.token) {
      return (fullPath = `/token/${path}`);
    }
    if (item?.postAccount) {
      return (fullPath = `/profile/${path}`);
    }
  };

  return (
    <>
      <ContainerSideBarContent className="side-bar-content" onClick={handleOnClick}>
        <div className="wrapper">
          <div className="social-digest">
            <div className="header-bar">
              <h3>Digest</h3>
              <Button
                type="primary"
                className="no-border-btn animate__animated animate__heartBeat"
                icon={<LeftOutlined />}
                onClick={() => dispatch(toggleCollapsedSideNav(!navCollapsed))}
              />
            </div>
            <ItemQuickAccess
              icon={'/images/ico-newfeeds.svg'}
              text={'Feeds'}
              direction="horizontal"
              onClickItem={() => handleIconClick('/')}
            />
            {filterGroup.map(item => {
              return <ShortCutItem item={item} onClickIcon={() => dispatch(setSelectedPost(item.id))} />;
            })}
          </div>
        </div>
      </ContainerSideBarContent>
    </>
  );
};

export default SidebarContent;
