import { Button, Drawer, Modal } from 'antd';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closeModal } from '@store/modal/actions';
import { useState } from 'react';
import { closeActionSheet } from '@store/action-sheet/actions';
import { CloseOutlined } from '@ant-design/icons';

const ContainerGuide = styled.div`
  .guide-header {
    position: relative;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color-dark-base);
    div {
      display: flex;
      align-items: center;
    }
    h3 {
      font-size: 16px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      margin: 0;
      margin-left: 1rem;
    }
    .close-btn {
      position: absolute;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 1.5rem;
      right: 1rem;
      border: 1px solid var(--color-primary);
      border-radius: 50%;
      .anticon-close {
        color: var(--color-primary);
        font-size: 10px;
      }
    }
  }
  .guide-content {
    text-align: left;
    padding: 1rem;
    p {
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      &:last-child {
        margin: 0;
      }
    }
    .ico-guide {
      width: 20px;
      height: 20px;
      padding: 3px;
      border: 1px solid var(--border-color-dark-base);
      border-radius: 4px;
      background: #fff;
    }
    .img-add-to-home {
      width: 130px;
      padding: 4px;
      border: 1px solid var(--border-color-dark-base);
      border-radius: 4px;
      background: #fff;
    }
  }
`;

export const InstallPwaGuide: React.FC<any> = props => {
  const { classStyle } = props;
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);

  const handleOnCancel = () => {
    dispatch(closeActionSheet());
  };

  return (
    <>
      <Drawer
        className={`${classStyle} action-sheet-bottom action-sheet-install-pwa-guide`}
        placement={'bottom'}
        closable={false}
        onClose={handleOnCancel}
        open={open}
        height={'auto'}
      >
        <ContainerGuide>
          <div className="guide-header">
            <div>
              <img width={35} src="/images/lixilotus-logo.svg" alt="" />
              <h3>{intl.get('guide.title')}</h3>
            </div>
            <Button onClick={handleOnCancel} className="close-btn" icon={<CloseOutlined />} />
          </div>
          <div className="guide-content">
            <p>{intl.get('guide.body')}</p>
            <p>
              {intl.get('guide.descOne')} &nbsp; <img className="ico-guide" src="/images/guide-safari.svg" alt="" />
            </p>
            <p>
              {intl.get('guide.descTwo')} &nbsp; <img className="ico-guide" src="/images/guide-share.svg" alt="" />
            </p>
            <p>
              {intl.get('guide.descThree')} &nbsp;{' '}
              <img className="img-add-to-home" src="/images/guide-add-to-home.png" alt="" />
            </p>
          </div>
        </ContainerGuide>
      </Drawer>
    </>
  );
};
