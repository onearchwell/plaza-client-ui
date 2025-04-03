export interface DriveItem {
  id: string
  name: string
  size?: number
  lastModifiedDateTime?: string
  folder?: {
    childCount: number
  }
  file?: {
    mimeType: string
  }
}

