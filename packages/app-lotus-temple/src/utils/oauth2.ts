export const getOauth2URL = () => {
  return `${process.env.NEXT_PUBLIC_LIXI_URL}/oauth2/confirmation?response_type=code&client_id=${process.env.NEXT_LIXI_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LIXI_CALLBACK}&scope=email+openid`;
};

export default getOauth2URL;
