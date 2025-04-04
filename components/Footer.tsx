"use client"
import * as React from "react"
import { Stack, Text, Link, DialogFooter, Dialog, DialogType } from "@fluentui/react"
import { MessageSquare } from "lucide-react"
import { useState } from "react"
import {
  Label,
  PrimaryButton,
  DefaultButton,
  TextField,
} from "@fluentui/react"

interface FooterProps {
  onFeedbackClick: () => void
  spContext?: any // Add SharePoint context
  sp?: any // Add SharePoint context
  currentPath?: string // Add SharePoint context
  fileId?: string // Add SharePoint context
}

export const Footer: React.FC<FooterProps> = ({ onFeedbackClick, spContext , currentPath, sp, fileId}) => {
  // Get SharePoint site information if available
    const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState<boolean>(false)
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

  
  const siteInfo = React.useMemo(() => {
    if (spContext && spContext.pageContext) {
      return {
        siteTitle: spContext.pageContext.web.title || "",
        serverRelativeUrl: spContext.pageContext.web.serverRelativeUrl || "",
      }
    }
    return null
  }, [spContext])
  const hideUploadDialog = () => {
      
    setIsFeedbackFormOpen(false)
    setName('')
    setComment('')
  }

  const handleCommentChange = (e, newValue) => {
    setComment(newValue);
  };
  const handleNameChange = (e, newValue) => {
    setName(newValue);
  };

 
    const handleSubmitFeedback = async (): Promise<void> => {
      try {
        await fetch('/api/sharepoint/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: comment,
            name: name,
            fileId: (fileId || '').toString(),
            currentPath: currentPath
          })
        });

        setIsSubmitted(true); // Show success message
        // Close the pop-up after 2 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 2000);
  
        setIsFeedbackFormOpen(false)
        setName('')
        setComment('')

      } catch (error) {
        console.log("Error adding item:", error);
        setIsFeedbackFormOpen(false)

      }
    };
  
  const dialogFeedbackContentProps = {
    styles: {
      title: {
        padding: "0px", // Remove padding
        fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif", // Set font
        fontSize: "20px", // Optional: Adjust size
        fontWeights: "bold", // Optional: Make it bold
      },
      subText: {
        padding: "0px",
        margin: "0px",
        fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif",
      },
      content: {
        padding: "20px 30px",
        minwidth: "800px",
        maxHeight: "80vh",
      },
    },
    type: DialogType.normal,
    title: "Send Feedback",
    subText: "We value your feedback to help us improve Plaza's Resource Center",
  }
  const modalProps = {
    isBlocking: false,
    styles: {
      main: {
        width: "500px",
        maxHeight: "80vh",
        overflowY: "hidden",
        padding: "0px",
        borderRadius: "12px"
      },
    },
  }
  return (
    <div className="border-t border-gray-200 bg-gray-50 p-3">
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        style={{
          backgroundColor: '#F9FAFB',
          border: '2px solid #f0efef',
          padding: '20px'
        }}
      >
        <Stack>
          <Text variant="small" className="text-gray-500">
            &copy; {new Date().getFullYear()} Plaza Resource Center
          </Text>
          {siteInfo && (
            <Text variant="small" className="text-gray-400">
              {siteInfo.siteTitle} • {siteInfo.serverRelativeUrl}
            </Text>
          )}
        </Stack>
        <Link
          className="text-purple-700 hover:text-purple-800 cursor-pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={()=>{setIsFeedbackFormOpen(true)}}
        >
          <MessageSquare
            style={{
              height: '1rem',
              width: '1rem',
              marginRight: '5px',
              color: '#970067',
            }}
          />
          <Text>Send Feedback</Text>
        </Link>
      </Stack>
      
      <Dialog
      hidden={!isFeedbackFormOpen}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Send Feedback',
        subText: "We value your feedback to help us improve Plaza's Resource Center",
        ...dialogFeedbackContentProps, // Pass through additional props
      }}
      onDismiss={hideUploadDialog}
      maxWidth={800}
      modalProps={modalProps}
      closeButtonAriaLabel="X"
    >
      <Stack tokens={{ childrenGap: 20 }} style={{ padding: "20px 0", fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif" }}>
        {/* Current Path */}
        <Stack
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
          horizontal
          verticalAlign="center"
          tokens={{ childrenGap: 10 }}
        >
          <Label style={{ minWidth: 150, fontWeight: 'bold' }}>Current Path</Label>
          <TextField value={currentPath} readOnly styles={{ root: { width: '100%', margin:'0 !important' } }} />
        </Stack>
        <Stack
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
          horizontal
          verticalAlign="center"
          tokens={{ childrenGap: 10 }}
        >
          <Label style={{ minWidth: 150, fontWeight: 'bold' }}>Name</Label>
            <TextField value={name}  onChange={handleNameChange} styles={{ root: { width: '100%', margin:'0 !important' } }} />
        </Stack>

        {/* Comment */}
        <Stack verticalAlign="center">
          <Label style={{ fontWeight: "bold" }}>Comment</Label>
          <TextField
            placeholder="Please share your feedback about this document or folder..."
            multiline
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            styles={{ root: { width: '100%' } }}
          />
        </Stack>
      </Stack>

      <DialogFooter>
        <DefaultButton onClick={hideUploadDialog} text="Cancel" style={{ borderRadius: '5px' }}  />
        <PrimaryButton
          onClick={handleSubmitFeedback}
          text="Submit Feedback"
          disabled={!comment} // Disable button if no comment
          style={{ borderRadius: '5px' }} 
        />
      </DialogFooter>
    </Dialog>
          {/* Fluent UI Dialog for success message */}
          <Dialog
        hidden={!isSubmitted}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Thanks for your feedback!',
          subText: 'Your feedback has been successfully submitted.',
        }}
        modalProps={{
          isBlocking: false,
        }}
      >
      </Dialog>
    </div>
    
  )
}

