import type { NextApiRequest, NextApiResponse } from "next"
import { submitFeedback } from "../../../lib/sharepoint"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { comment, name, fileId, currentPath } = req.body;

  if (!fileId || !comment) {
    return res.status(400).json({ message: "Missing madatory fields" })
  }

  try {
    const response = await submitFeedback(comment, name, fileId, currentPath)
    res.status(200).json({ success: true})
  } catch (error: any) {
    console.error("Error submitting feedback:", error)
    res.status(500).json({
      message: "Error submitting feedback",
      error: error.message || "Unknown error",
    })
  }
}

