import type { NextApiRequest, NextApiResponse } from "next"
import { fetchFileURL } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { itemId } = req.query

  if (!itemId || typeof itemId !== "string") {
    return res.status(400).json({ message: "Item ID is required" })
  }

  try {
    const response = await fetchFileURL(itemId)
    res.status(200).json(response.value)
  } catch (error: any) {
    console.error("Error fetching file details:", error)
    res.status(500).json({
      message: "Failed to fetch file details",
      error: error.message || "Unknown error",
    })
  }
}

