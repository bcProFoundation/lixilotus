export const extractHashtagFromText = (text: string) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = text.match(hashtagRegex);

  if (!hashtags || hashtags.length === 0) return null;

  return hashtags;
};
