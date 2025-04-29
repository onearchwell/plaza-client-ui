import type { NextApiRequest, NextApiResponse } from "next"
import { fetchFileURL } from "../../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { params } = req.query;

  if (!params || !Array.isArray(params)) {
    res.status(400).send('Missing parameters');
    return;
  }
  console.log(params)
  let weburl = params[0]

  console.log(params.length)
  if(params.length > 1) {
    weburl = '/' + params.join("/");
  }
  const encodedPath = weburl;

  const url = decodeURIComponent(encodedPath as string);

  if (!url) {
    return res.status(400).json({ message: "ServerRelativePath is required" })
  }

  try {
    const filename = url.split("/").pop(); 
    console.log("Filename is : ",filename)
    console.log("URL is : ",url)
    const response = await fetchFileURL(url)
    res.status(200);

    const buffer = Buffer.from(response.data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.end(buffer); 
  } catch (error: any) {
    console.error("Error fetching file details:", error)
    res.status(500).json({
      message: "Failed to fetch file details",
      error: error.message || "Unknown error",
    })
  }
}

