import type { NextApiRequest, NextApiResponse } from "next"
import { fetchFolderItems } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { itemId } = req.query

  if (!itemId || typeof itemId !== "string") {
    return res.status(400).json({ message: "Item ID is required" })
  }

  try {
    const response = await fetchFolderItems(itemId)
    res.status(200).json(response.value)
  } catch (error: any) {
    console.error("Error fetching folder items:", error)
    res.status(500).json({
      message: "Failed to fetch folder items",
      error: error.message || "Unknown error",
    })
  }
}

