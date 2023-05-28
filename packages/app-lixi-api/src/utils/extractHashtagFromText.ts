export const extractHashtagFromText = (text: string, multiple?: boolean) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = text.match(hashtagRegex);

  if (!hashtags || hashtags.length === 0) return null;

  if (multiple) {
    return hashtags;
  } else {
    return hashtags[0];
  }
};
