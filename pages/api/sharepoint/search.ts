import type { NextApiRequest, NextApiResponse } from "next"
import { searchQuery } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { query, group } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Missing madatory field" })
  }

  try {
    const response = await searchQuery(query, group)
    res.status(200).json({"results": response})
  } catch (error: any) {
    console.error("Error submitting search:", error.data)
    res.status(500).json({
      message: "Error submitting search",
      error: error.message || "Unknown error",
    })
  }
}

