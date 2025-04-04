import type { NextApiRequest, NextApiResponse } from "next"
import { fetchFileURL } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }
  const { url, accept } = req.body;

  if (!url) {
    return res.status(400).json({ message: "ServerRelativePath is required" })
  }

  try {
    const response = await fetchFileURL(url)
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    res.status(200);
    res.setHeader('Content-Type', accept);
    res.setHeader('Content-Disposition', `attachment; filename="${lastPart}"`);
    res.send(response.data);
  } catch (error: any) {
    console.error("Error fetching file details:", error)
    res.status(500).json({
      message: "Failed to fetch file details",
      error: error.message || "Unknown error",
    })
  }
}

