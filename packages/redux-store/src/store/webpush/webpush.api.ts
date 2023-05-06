import { api } from './webpush.generated';

const enhancedApi = api.enhanceEndpoints({
  endpoints: {
    CreateWebpushSubscriber: {},
    UpdateWebpushSubscriber: {}
  }
});

export { enhancedApi as api };

export const { useCreateWebpushSubscriberMutation, useUpdateWebpushSubscriberMutation } = enhancedApi;
