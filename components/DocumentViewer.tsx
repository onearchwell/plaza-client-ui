import * as React from 'react';
import { IStackStyles, PrimaryButton, Stack, Text } from '@fluentui/react';
import PdfViewer from './PdfViewer'; // The PDF Viewer component
import DocxViewer from './DocxViewer'; // The DOCX Viewer component
import { useEffect, useState } from 'react';

const stackfontStyles: IStackStyles = {
  root: {
    width: "90%",
    height: "90%",
  },
};

const DocumentViewer: React.FC<{ fileUrl: string}> = ({ fileUrl }) => {
  const [fileType, setfileType] = useState<string>('unknown');
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  // Fetch the DOCX file and convert it to HTML
  useEffect(() => {

      const downloadAndDisplayFile = async (mimeType: string) => {
        try {
            // console.log("Fetching file :",fileUrl, mimeType)
            const response = await fetch('/api/sharepoint/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': mimeType,
                },
                body: JSON.stringify({ url: fileUrl, accept: mimeType})
            });

            if (response.ok) {
                // Create a blob from the file content and set the URL
                const fileBlob = await response.blob();
                setFileBlob(fileBlob);
            } else {
                console.error('Error downloading file:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const findDocType = async () => {
      const extension = fileUrl.split('.').pop()?.toLowerCase().toLowerCase();
      // console.log("In DocumentViewer :", extension, fileUrl)
      let mimeType = 'application/pdf';

      switch (extension) {
          case 'pdf':
            setfileType("pdf")
            mimeType = 'application/pdf'
            break;
          case 'doc':
              setfileType("doc")
              mimeType = 'application/msword'
              break;
          case 'docx':
              setfileType("doc")
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              break;
          case 'xls':
              setfileType("excel")
              mimeType = 'application/vnd.ms-excel'
              break;
          case 'xlsx':
              setfileType("excel")
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              break;
          default:
              setfileType("unknown")
              mimeType = 'application/octet-stream'
              break;
      }
      await downloadAndDisplayFile(mimeType)
    };
    findDocType();
  }, [fileUrl]);



  const onDownload = () => {
    if (fileBlob) {
      const fileName = fileUrl.split("/").pop(); // Extract file name from URL
      const link = document.createElement('a');
      link.href = URL.createObjectURL(fileBlob);
      link.download = fileName;
      link.click();
    }
  };

  return (
    <Stack tokens={{ childrenGap: 20 }} styles={stackfontStyles}>
      {fileType === 'pdf' ? 
        <PdfViewer pdfUrl={fileUrl} fileBlob={fileBlob}/>
        :
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: 'rgb(60, 60, 60)',
              height: "56px"
            }}
          >
            <PrimaryButton onClick={onDownload}
            iconProps={{ iconName: 'Download' }} 
            styles={{
              root: {
                backgroundColor: 'rgb(60, 60, 60)',
                borderColor: 'rgb(60, 60, 60)',
                color: 'white',
                borderRadius: '15px',
                minWidth: '30px',
                minHeight: '30px',
                maxHeight: '30px',
                maxWidth: '30px',
                alignSelf: 'center',
                padding: '2px 2px',
                paddingRight: '10px' 
              },
              rootHovered: {
                backgroundColor: 'rgb(154,160,166)',
                borderColor: 'rgb(154,160,166)'
              },
              rootPressed: {
                borderColor: 'rgb(154,160,166)'
              }
            }}
          >
          </PrimaryButton>
        </div>

        {fileType === 'doc' ? 
          (
            <DocxViewer docxUrl={fileUrl} fileBlob={fileBlob}/>
          ) : (
            <Stack
              tabIndex={0}
              className="docx-container"
              styles={{
              root: {
                width: "100%",
                height: "500px",
                overflow: "auto",
                border: "1px solid #ddd",
                padding: "1px",
                background: "#fff",
              }}}>
              <Text variant="medium">To access this document, please click the download button at the top right.</Text>
            </Stack>
          )
          }
        </div>
  }
  </Stack>
  );
};

export default DocumentViewer;
