import styled from 'styled-components';
import { ItemAccess } from './SideBarShortcut';
import intl from 'react-intl-universal';
import SidebarUserLogin from './SidebarUserLogin';
import { ShortcutItemAccess } from './SideBarRanking';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: Function;
};

const ContainerSideBarContent = styled.div`
  height: 100%;
  text-align: left;
  margin: 1rem 0;
`;

const StyledContainerAccess = styled.div`
  display: flex;
  flex-direction: column;
  .item-access {
    gap: 1rem !important;
    padding: 1rem 0;
    .text-item {
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0.5px;
      color: #1e1a1d;
    }
  }
`;

const StyledContainerShortcut = styled.div`
  padding: 1rem 0;
  margin: 1rem 0;
  border-top: 1px solid var(--boder-item-light);
  border-bottom: 1px solid var(--boder-item-light);
  display: flex;
  flex-direction: column;
  h3 {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: var(--text-color-on-background);
    margin-bottom: 1rem;
  }
  .item-access {
    gap: 1rem !important;
    padding-bottom: 1rem;
  }
`;

const SidebarContent = ({ className }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const [isCollapse, setIsCollapse] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);
  const { data } = useInfinitePagesQuery(
    {
      first: 10
    },
    true
  );

  const randomShortCut = _.sampleSize(data, 5);

  const handleOnClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  return (
    <>
      <ContainerSideBarContent onClick={handleOnClick}>
        <SidebarUserLogin />
        <StyledContainerShortcut>
          <h3>Your shortcuts</h3>
          {randomShortCut &&
            randomShortCut.map((item, index) => {
              return (
                <>
                  <ShortcutItemAccess icon={item.avatar} text={item.name} href={`/page/${item.id}`} />
                </>
              );
            })}
        </StyledContainerShortcut>
        <StyledContainerAccess>
          <ItemAccess
            icon={'/images/ico-account.svg'}
            text={intl.get('general.accounts')}
            active={false}
            key="wallet-lotus"
            href={'/wallet'}
            direction={'horizontal'}
          />
          <ItemAccess
            icon={'/images/ico-lixi.svg'}
            text={intl.get('general.lixi')}
            active={false}
            key="lixi"
            href={'/lixi'}
            direction={'horizontal'}
          />
          <ItemAccess
            icon={'/images/ico-setting.svg'}
            text={intl.get('general.settings')}
            active={false}
            key="settings"
            href={'/settings'}
            direction={'horizontal'}
          />
        </StyledContainerAccess>
      </ContainerSideBarContent>
    </>
  );
};

export default SidebarContent;
