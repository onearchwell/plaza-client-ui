import { GetServerSideProps } from "next";
import * as CryptoJS from 'crypto-js';
import * as cookie from "cookie";

const allowedPermissions = ["ResCtrUser", "ResCtrWHL", "ResCtrRev", "ResCtrCOR", "ResCtrMC"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query, res } = context;
  const userId = context.query.me as string;
  const env = context.query.env as string;
  const fileId = context.query.fileId as string;

  let originalhost = context.req.headers.host;
  console.log(originalhost)
  let newhost = originalhost

  if (originalhost === 'plaza-client-ui-prod-asgwa4g7c0abfyhz.eastus2-01.azurewebsites.net') {
    newhost = `resourcecenter.plazahomemortgage.com`;
  }

  const checkMe = (user: string, env: string): boolean =>  {

    let result = false;
    if(allowedPermissions.includes(user)) {
        result = true
    }
    return result
  }

  if (!userId || !checkMe(userId, env)) {
    let fullUrl = `https://${newhost}/unauthorized`;
    return {
      redirect: {
        destination: fullUrl,
        permanent: false,
      },
    };
  }

  // if (host === 'resourcecenterprod.plazahomemortgage.com') {
  if (originalhost === 'plaza-client-ui-prod-asgwa4g7c0abfyhz.eastus2-01.azurewebsites.net') {
    let fullUrl = `https://${newhost}/main?me=${userId}`;
    if (fileId)
      fullUrl = fullUrl + `&fileId=${fileId}`
    console.log(fullUrl)
    return {
      redirect: {
        destination: fullUrl,
        permanent: false,
      },
    };
  }

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("me", userId, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24,
    })
  );

  const queryString = fileId ? `/?fileId=${fileId}` : "/";
  return {
    redirect: {
      destination: `${queryString}`, // Pass entire query string
      permanent: false,
    },
  };
};

const MainPage = () => {
  return null; // This page won't be visible as it redirects
};

export default MainPage;
