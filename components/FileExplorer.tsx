"use client"

import React from "react"
import type { DriveItem } from "../types"
import { ChevronLeft } from "lucide-react"
import { getFileIcon, formatFileSize } from "../utils/file-icons"

interface FileExplorerProps {
  items: DriveItem[]
  loading: boolean
  error: string | null
  pathHistory: { id: string; name: string }[]
  onFolderClick: (item: DriveItem) => void
  onNavigateBack: () => void
  onRootClick: () => void
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  items,
  loading,
  error,
  pathHistory,
  onFolderClick,
  onNavigateBack,
  onRootClick,
}) => {
  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Breadcrumb navigation */}
      <div className="flex items-center p-4 border-b">
        <button
          onClick={onNavigateBack}
          disabled={pathHistory.length === 0}
          className={`mr-2 p-1 rounded ${
            pathHistory.length === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center overflow-x-auto">
          <span className={`cursor-pointer ${pathHistory.length === 0 ? "font-semibold" : ""}`} onClick={onRootClick}>
            Root
          </span>
          {pathHistory.map((path, index) => (
            <React.Fragment key={path.id}>
              <span className="mx-1">/</span>
              <span
                className={`cursor-pointer truncate max-w-xs ${index === pathHistory.length - 1 ? "font-semibold" : ""}`}
              >
                {path.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* File list */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500">This folder is empty</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center p-3 hover:bg-gray-50 ${item.folder ? "cursor-pointer" : ""}`}
              onClick={() => item.folder && onFolderClick(item)}
            >
              <div className="mr-3">{getFileIcon(item)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.folder
                    ? `${item.folder.childCount} item${item.folder.childCount !== 1 ? "s" : ""}`
                    : item.size
                      ? `${formatFileSize(item.size)}`
                      : ""}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {item.lastModifiedDateTime && new Date(item.lastModifiedDateTime).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileExplorer

