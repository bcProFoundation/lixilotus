import InfoCardUser from '@components/Common/InfoCardUser';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';
import { ShortcutItemAccess } from './SideBarRanking';

const ContainerUserLogin = styled.div``;

const LoggedAsAnonymous = styled.div`
  .item-access {
    p {
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0.5px;
      color: rgba(30, 26, 29, 0.6) !important;
    }
  }
`;

const LoggedAsAccount = styled.div``;

const SidebarUserLogin: React.FC = () => {
  return (
    <ContainerUserLogin>
      <Link href={'/wallet'}>
        <LoggedAsAnonymous>
          <ShortcutItemAccess icon="/images/anonymous-ava.svg" text="You're anonymous" href={'/'} />
        </LoggedAsAnonymous>
        {/* TODO: implement when account has create */}
        {/* <LoggedAsAccount>
        <InfoCardUser type="card" imgUrl={null} name={'Nghia Cao'} title={'@nghiacc'}/>
        </LoggedAsAccount> */}
      </Link>
    </ContainerUserLogin>
  );
};

export default SidebarUserLogin;
