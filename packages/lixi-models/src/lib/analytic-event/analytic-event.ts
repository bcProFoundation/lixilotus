export class AnalyticEvent {
  accountId?: Nullable<number>;
  timestamp?: Nullable<Date>;
  eventType: 'view' | 'click' | 'impression';
  eventData: ViewEventData | ImpressionEventData;
}

export class ViewEventData {
  id: string;
  type: 'post' | 'profile';
}

export class ImpressionEventData {
  id: string;
  type: 'post' | 'profile';
}
