// import axios from 'axios';
// import { dev, prod } from "./constant";

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const callApi = async (inputMessage: string, permissionGroup: string, sessionId: string) => {
  try {
    // console.log("Query:", { inputMessage, permissionGroup });
    const BASE_URL = process.env.NEXT_PUBLIC_CHATBOT_BASE_URL!;
    console.log("permissionGroup:", BASE_URL, permissionGroup);
    const response = await fetch(
      BASE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputMessage,
          permissionGroup: permissionGroup,
          sessionId: sessionId
        }),
      }
    );

    console.log("Response Status:", response.status);

    // Check if the response is OK (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching API:", error);
    return {
      choices: [
        {
          message: {
            content: 'Sorry, something went wrong. Please try again.',
          },
        },
      ],
    };
  }
};

export const completeFilePath = (filepath: string) => { 
  
  const SITE = process.env.NEXT_PUBLIC_CHATBOT_SITE!;
  const sanitizedFilePath = filepath.startsWith('/')
    ? filepath.substring(1)
    : filepath;

  // Construct the complete SharePoint URL
  const completePath = `https://plazahomemortgage.sharepoint.com/sites/${SITE}/Plaza%20Resource%20Center/${encodeURI(
    sanitizedFilePath
  )}`;

  return completePath;
};

export const fileName = (filepath: string) => {

  // const filepath = "Plaza Product Information/Program Guidelines/Non-Conforming/Investor AUS Interest Only Program Guidelines.pdf"
  const parts = filepath.split("/")
  const fileName = parts[parts.length -1]
  return fileName;

};