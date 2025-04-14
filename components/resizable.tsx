"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "../utils/utils"

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

interface ResizablePanelProps extends React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel> {
  collapsible?: boolean
  collapsedSize?: number
  minSize?: number
  defaultSize?: number
  maxSize?: number
  collapsed?: boolean
  onCollapse?: () => void
  onExpand?: () => void
}

const ResizablePanel = React.forwardRef<React.ElementRef<typeof ResizablePrimitive.Panel>, ResizablePanelProps>(
  (
    {
      className,
      children,
      collapsible,
      collapsedSize,
      minSize = 0,
      maxSize = 100,
      defaultSize,
      collapsed,
      onCollapse,
      onExpand,
      ...props
    },
    ref,
  ) => {
    const collapsibleProps = collapsible
      ? {
          collapsible,
          ...(collapsedSize !== undefined ? { collapsedSize } : {}),
          ...(collapsed !== undefined ? { collapsed } : {}),
          ...(onCollapse !== undefined ? { onCollapse } : {}),
          ...(onExpand !== undefined ? { onExpand } : {}),
        }
      : {}

    return (
      <ResizablePrimitive.Panel
        ref={ref}
        className={cn("relative h-full", className)}
        minSize={minSize}
        maxSize={maxSize}
        defaultSize={defaultSize}
        {...collapsibleProps}
        {...props}
      >
        {children}
      </ResizablePrimitive.Panel>
    )
  },
)
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean
  }
>(({ className, withHandle, ...props }, ref) => (
  <ResizablePrimitive.PanelResizeHandle
    ref={ref}
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
