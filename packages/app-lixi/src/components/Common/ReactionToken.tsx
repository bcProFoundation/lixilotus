import styled from 'styled-components';
import { BurnForType } from '@bcpros/lixi-models/lib/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Space, Popover } from 'antd';
import { openModal } from '@store/modal/actions';
import React, { useEffect, useState } from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { OPTION_BURN_TYPE, OPTION_BURN_VALUE } from '@bcpros/lixi-models/constants';
import { formatBalance } from 'src/utils/cashMethods';
import { getCurrentThemes } from '@store/settings';
import { TokenItem } from '@components/Token/TokensFeed';

const SpaceIconBurnHover = styled(Space)`
  min-height: 38px;
  padding: 8px;
  border-radius: 12px;
  img {
    transition: all 0.2s ease-in-out;
    width: 28px;
    height: 28px;
  }

  .ant-space-item > span {
    display: flex;
    align-items: end;
  }

  &:hover {
    background: #ecf0ff;
  }
`;

const StyledBurnIconHover = styled.img`
  transition: all 0.2s ease-in-out;
  width: 24px;
  height: 24px;
  align-self: center;
  cursor: pointer;

  &:active {
    animation: jump 0.6s ease-in-out;
  }

  @keyframes jump {
    0% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
    70% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0);
    }
  }

}
`;

const Hint = styled.span`
  display: flex;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 1px 3px;
`;

const HintMobile = styled.span`
  display: flex;
  justify-content: center;
  color: #000;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const SpaceContentBurn = styled(Space)`
  display: flex;
  .ant-space-item {
    width: 42px;
    height: 42px;
    display: flex;
    justify-content: center;
    align-items: end;
    background: none;
    border-radius: var(--border-radius-primary);
  }

  .container-ico-hover {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: end;
    background: #fff;
    border-radius: 24px;
    transition: all 0.15s ease-in-out;
    img {
      transition: all 0.15s ease-in-out;
      width: 24px;
      height: 24px;
      align-self: center;
      cursor: pointer;
    }
  }

  .ant-popover-open {
    width: 100%;
    height: 100%;
    img {
      width: 32px;
      height: 32px;
    }
  }
`;

type ReactionTokenProps = {
  token?: TokenItem;
  handleBurnForToken?: (isUpVote: boolean, token: any, optionBurn?: string) => Promise<void>;
};

const ReactionToken = ({ token, handleBurnForToken }: ReactionTokenProps) => {
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { width } = useWindowDimensions();
  const currentTheme = useAppSelector(getCurrentThemes);

  useEffect(() => {
    const isMobile = width < 868 ? true : false;
    setIsMobile(isMobile);
  }, [width]);

  const contentHoverLike = <Hint>+{OPTION_BURN_VALUE.LOVE} </Hint>;

  const contentHoverDisLike = <Hint>+{OPTION_BURN_VALUE.LIKE}</Hint>;

  const contentHoverHeart = <Hint>-{OPTION_BURN_VALUE.DISLIKE}</Hint>;

  const contentHoverCustom = <Hint>Custom</Hint>;

  const handleBurnOption = (e: React.MouseEvent<HTMLElement>, dataItem: any, optionBurn: string, isUpVote: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    handleBurnForToken(isUpVote, dataItem, optionBurn);
    hideReact();
  };

  const hideReact = () => {
    setClicked(false);
    setHovered(false);
  };

  const handleHoverChange = (open: boolean) => {
    setHovered(open);
    setClicked(false);
  };

  const handleClickChange = (open: boolean) => {
    setHovered(false);
    setTimeout(() => {
      setClicked(open);
    }, 100);
  };

  const openBurnModal = (e: React.MouseEvent<HTMLElement>, dataItem: any) => {
    dispatch(
      openModal('BurnModal', {
        burnForType: BurnForType.Token,
        id: dataItem.tokenId,
        isPage: dataItem.page ? true : false,
        classStyle: 'ahihi'
      })
    );
    hideReact();
  };

  const contentBurn = (
    <SpaceContentBurn>
      <Popover
        arrow={false}
        overlayClassName="popover-custom-hint"
        placement="top"
        content={contentHoverLike}
        trigger="hover"
      >
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/heart.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/heart-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/heart.svg')}
            onClick={e => handleBurnOption(e, token, OPTION_BURN_TYPE.LOVE, true)}
          />
        </div>
      </Popover>
      <Popover
        arrow={false}
        overlayClassName="popover-custom-hint"
        placement="top"
        content={contentHoverDisLike}
        trigger="hover"
      >
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/like.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/like-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/like.svg')}
            onClick={e => handleBurnOption(e, token, OPTION_BURN_TYPE.LIKE, true)}
          />
        </div>
      </Popover>
      <Popover
        arrow={false}
        overlayClassName="popover-custom-hint"
        placement="top"
        content={contentHoverHeart}
        trigger="hover"
      >
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/dislike.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/dislike-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/dislike.svg')}
            onClick={e => handleBurnOption(e, token, OPTION_BURN_TYPE.DISLIKE, false)}
          />
        </div>
      </Popover>
      <Popover
        arrow={false}
        overlayClassName="popover-custom-hint"
        placement="top"
        content={contentHoverCustom}
        trigger="hover"
      >
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/more-horiz.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/more-horiz-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/more-horiz.svg')}
            onClick={e => openBurnModal(e, token)}
          />
        </div>
      </Popover>
    </SpaceContentBurn>
  );

  const contentBurnMobile = (
    <SpaceContentBurn>
      <Popover arrow={false} overlayClassName="popover-custom-hint">
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/heart.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/heart-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/heart.svg')}
            onClick={e => handleBurnOption(e, token, OPTION_BURN_TYPE.LOVE, true)}
          />
        </div>
        <HintMobile>+{OPTION_BURN_VALUE.LOVE} </HintMobile>
      </Popover>
      <Popover arrow={false} overlayClassName="popover-custom-hint">
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/like.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/like-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/like.svg')}
            onClick={e => handleBurnOption(e, token, OPTION_BURN_TYPE.LIKE, true)}
          />
        </div>
        <HintMobile>+{OPTION_BURN_VALUE.LIKE}</HintMobile>
      </Popover>
      <Popover arrow={false} overlayClassName="popover-custom-hint">
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/dislike.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/dislike-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/dislike.svg')}
            onClick={e => handleBurnOption(e, token, OPTION_BURN_TYPE.DISLIKE, false)}
          />
        </div>
        <HintMobile>+{OPTION_BURN_VALUE.DISLIKE}</HintMobile>
      </Popover>
      <Popover arrow={false} overlayClassName="popover-custom-hint">
        <div className="container-ico-hover">
          <StyledBurnIconHover
            src={'/images/more-horiz.svg'}
            onMouseOver={e => {
              e.currentTarget.src = '/images/more-horiz-w-burn.svg';
            }}
            onMouseOut={e => (e.currentTarget.src = '/images/more-horiz.svg')}
            onClick={e => openBurnModal(e, token)}
          />
        </div>
        {isMobile && <HintMobile>Custom</HintMobile>}
      </Popover>
    </SpaceContentBurn>
  );

  const IconBurnHover = ({ burnValue, classStyle }: { burnValue?: number; classStyle?: string }) => (
    <SpaceIconBurnHover wrap size={5}>
      <Popover
        overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''}`}
        arrow={false}
        overlayInnerStyle={{
          display: 'flex',
          gap: '4px',
          padding: isMobile ? '16px 8px 8px 8px' : '0 8px 8px 8px',
          background: '#d7e3ff',
          boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
          marginLeft: isMobile ? '1rem' : '0'
        }}
        content={isMobile ? contentBurnMobile : contentBurn}
        trigger={isMobile ? 'click' : 'hover'}
        open={isMobile ? clicked : hovered}
        onOpenChange={isMobile ? handleClickChange : handleHoverChange}
      >
        <picture>
          <img className={classStyle} alt="burnIcon" src={'/images/ico-burn-up.svg'} />
        </picture>
      </Popover>
    </SpaceIconBurnHover>
  );

  return (
    <>
      <IconBurnHover burnValue={formatBalance(token?.lotusBurnScore ?? 0)} />
    </>
  );
};

export default ReactionToken;
