import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import * as CryptoJS from 'crypto-js';

const allowedPermissions = ["ResCtrUser", "ResCtrWL", "ResCtrRev", "ResCtrCOR", "RecCtrMC"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const userId = context.query.me as string;

  const checkMe = (user: string): boolean =>  {
    // const key = "hufhwflkcklscklsnsdcjdsck"
    // const encryptedMessage = CryptoJS.AES.encrypt(user, key).toString();
    // console.log('Encrypted Message:', encryptedMessage);
    // const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    // const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
    // console.log('Decrypted Message:', decryptedMessage);
    return allowedPermissions.includes(user)
  }

  if (!userId || !checkMe(userId)) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }
  const queryString = new URLSearchParams(query as ParsedUrlQuery).toString();
  return {
    redirect: {
      destination: `/?${queryString}`, // Pass entire query string
      permanent: false,
    },
  };
};

const MainPage = () => {
  return null; // This page won't be visible as it redirects
};

export default MainPage;
