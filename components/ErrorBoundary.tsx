"use client"
import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error)
    console.error("Error Info:", errorInfo)

    // Add SharePoint-specific logging
    try {
      // Log to SharePoint if in a SharePoint context
      const context = (window as any)._spPageContextInfo
      if (context) {
        console.log("SharePoint context detected for error logging", context)
        // Could add custom SharePoint logging here
      }
    } catch (e) {
      console.error("Failed to log error to SharePoint:", e)
    }
  }

  public render() {
    if (this.state.hasError) {
      // Enhanced SharePoint-friendly UI for errors
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-2">{this.state.error?.message}</p>
            <p className="text-sm text-red-500">
              If this problem persists, please contact your SharePoint administrator.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Reload Web Part
              </button>
              <button
                className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

