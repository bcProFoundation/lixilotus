import _ from 'lodash';

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
