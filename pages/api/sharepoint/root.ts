import type { NextApiRequest, NextApiResponse } from "next"
import { fetchRootItems } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }
  const { path, group } = req.body;

  if (!path || typeof path !== "string") {
    return res.status(400).json({ message: "folderPath is required" })
  }
  try {
    const response = await fetchRootItems(path, group)
    res.status(200).json(response)
  } catch (error: any) {
    console.error("Error fetching root items:", error)
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message || "Unknown error",
    })
  }
}
