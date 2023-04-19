import _ from 'lodash';
import moment from 'moment';

export const formatDate = (dateString: string, userLocale: string = 'en') => {
  const options: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
  const dateFormattingError = 'Unable to format date.';

  try {
    if (dateString) {
      return new Date(_.toNumber(dateString) * 1000).toLocaleDateString(userLocale, options);
    }
    return new Date().toLocaleDateString(userLocale, options);
  } catch (error) {
    return dateFormattingError;
  }
};


export const formatRelativeTime = (createdAt: Date) => {
  const yesterday = moment().subtract(2, 'day');
  if (!createdAt) {
    return;
  } else if (moment(createdAt).isAfter(yesterday)) {
    return moment(createdAt).fromNow().toString();
  } else {
    return moment(createdAt).format('l');
  }
}
