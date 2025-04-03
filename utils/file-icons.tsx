import { FileText, FileImage, FileArchive, FileAudio, FileVideo, Folder } from "lucide-react"
import type { DriveItem } from "../types"

export function getFileIcon(item: DriveItem) {
  if (item.folder) {
    return <Folder className="w-5 h-5 text-yellow-500" />
  }

  const fileExtension = item.name.split(".").pop()?.toLowerCase()

  switch (fileExtension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
      return <FileImage className="w-5 h-5 text-purple-500" />
    case "mp3":
    case "wav":
    case "ogg":
      return <FileAudio className="w-5 h-5 text-green-500" />
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return <FileVideo className="w-5 h-5 text-red-500" />
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <FileArchive className="w-5 h-5 text-orange-500" />
    default:
      return <FileText className="w-5 h-5 text-blue-500" />
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

