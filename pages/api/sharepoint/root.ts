import type { NextApiRequest, NextApiResponse } from "next"
import { fetchRootItems } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const response = await fetchRootItems()
    res.status(200).json(response)
  } catch (error: any) {
    console.error("Error fetching root items:", error)
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message || "Unknown error",
    })
  }
}
