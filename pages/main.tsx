import { GetServerSideProps } from "next";
import * as CryptoJS from 'crypto-js';
import * as cookie from "cookie";

const allowedPermissions = ["ResCtrUser", "ResCtrWHL", "ResCtrRev", "ResCtrCOR", "ResCtrMC"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query, res } = context;
  const userId = context.query.me as string;
  const env = context.query.env as string;
  const fileId = context.query.fileId as string;

  // const url = new URL(window.location.href);
  // if (url.hostname === 'resourcecenterprod.plazahomemortgage.com') {
  //   url.hostname = `resourcecenter.plazahomemortgage.com`;
  //   url.host = `resourcecenter.plazahomemortgage.com`;
  //   window.location.href = url.toString(); 
  // }

  const checkMe = (user: string, env: string): boolean =>  {

    let result = false;
    if (!env) {
      if(allowedPermissions.includes(user)) {
        result = true
      }
    } else {
      // const key = "hufhwflkcklscklsnsdcjdsck"
      // const encryptedMessage = CryptoJS.AES.encrypt(user, key).toString();
      // console.log('Encrypted Message:', encryptedMessage);
      // const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
      // const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
      // console.log('Decrypted Message:', decryptedMessage);
      result = false;
    }
    return result
  }

  if (!userId || !checkMe(userId, env)) {
    return {
      redirect: {
        destination: "/unauthorized",
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
