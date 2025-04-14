import type { NextApiRequest, NextApiResponse } from "next"
import { fetchByItemId } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }
  const { group, fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ message: "fileId is required" })
  }
  try {
    const response = await fetchByItemId(group, fileId)
    res.status(200).json(response)
  } catch (error: any) {
    console.error("Error fetching root items:", error)
    res.status(error.status).json({
      message: "Failed to fetch items",
      error: error.message || "Unknown error",
    })
  }
}
