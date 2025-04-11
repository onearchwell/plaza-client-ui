import type { NextApiRequest, NextApiResponse } from "next"
import { fetchFolderItems } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { path } = req.body;

  if (!path || typeof path !== "string") {
    return res.status(400).json({ message: "folderPath is required" })
  }

  try {
    const response = await fetchFolderItems(path)
    res.status(200).json(response)
  } catch (error: any) {
    console.error("Error fetching folder items:", error)
    res.status(500).json({
      message: "Failed to fetch folder items",
      error: error.message || "Unknown error",
    })
  }
}

