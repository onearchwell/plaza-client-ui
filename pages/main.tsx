import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";

const allowedPermissions = ["2FBF194333B91EFB882580520059E2E2", "9A6933CCBDA4E9BC88257F720001CAD7", "218266EE8CD8990607257A870056E66C", "742359CCC63132DD88257F720070BED3", "A38B30AEEBD452D507257A2B0079ECEC"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const userId = context.query.R as string | undefined;

  if (!userId || !allowedPermissions.includes(userId)) {
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
