import { EntityState } from '@reduxjs/toolkit';
import { PageMessageSessionQuery } from '@store/message/pageMessageSession.generated';

type PageMessageSessionItem = PageMessageSessionQuery['pageMessageSession'];

export interface PageState extends EntityState<any> {
  selectedId: string;
  pagesByAccountId: Array<any>;
  currentPageMessageSession: PageMessageSessionItem | null;
}
