import { api } from './timeline.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['TimelineItem'],
  endpoints: {
    HomeTimeline: {
      providesTags: ['TimelineItem'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { level, ...otherArgs } = queryArgs;
          return { level };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.homeTimeline.edges.push(...responseData.homeTimeline.edges);
        currentCacheData.homeTimeline.pageInfo = responseData.homeTimeline.pageInfo;
        currentCacheData.homeTimeline.totalCount = responseData.homeTimeline.totalCount;
      }
    }
  }
});

export { enhancedApi as api };

export const { useTimelineQuery, useLazyTimelineQuery, useHomeTimelineQuery, useLazyHomeTimelineQuery } = enhancedApi;
