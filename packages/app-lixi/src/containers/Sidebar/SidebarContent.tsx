import styled from 'styled-components';
import { ShortCutItem } from './SideBarShortcut';
import intl from 'react-intl-universal';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getFilterPostsHome, getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { push } from 'connected-next-router';
import { useRouter } from 'next/router';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import { getSelectedAccountId } from '@store/account/selectors';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';

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
      first: 30,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
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
      <ContainerSideBarContent onClick={handleOnClick}>
        <div className="wrapper">
          <div className="social-digest">
            <h3>Digest</h3>
            {filterGroup.map(item => {
              return <ShortCutItem item={item} onClickIcon={path => router.push(pathShortcutItem(item, path))} />;
            })}
          </div>
        </div>
      </ContainerSideBarContent>
    </>
  );
};

export default SidebarContent;
