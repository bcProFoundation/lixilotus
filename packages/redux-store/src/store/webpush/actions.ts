import { createAction } from '@reduxjs/toolkit';
import { CreateWebpushSubscriberInput } from 'src/generated/types.generated';

export const webpushSubscribe = createAction('webpush/webpushSubscribe');
export const createWebpushSubscriber = createAction<CreateWebpushSubscriberInput>('webpush/subscribeWebpushNotification');
