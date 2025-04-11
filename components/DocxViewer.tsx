import * as React from "react";
import { useEffect, useRef, useState } from "react";
import * as docx from "docx-preview"; // Import as a module
import { PrimaryButton, Stack } from "@fluentui/react";

const DocxViewer: React.FC<{ docxUrl: string, fileBlob: Blob}> = ({ docxUrl, fileBlob }) => {

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const downloadAndDisplayFile = async () => {
      try {
        const arrayBuffer = await fileBlob.arrayBuffer();

        if (containerRef.current) {
          containerRef.current.innerHTML = ""; // Clear old content
          await docx.renderAsync(arrayBuffer, containerRef.current); // No need for third argument
        }
      } catch (err) {
        
      }
    };

    downloadAndDisplayFile();
  }, [fileBlob]);

  return (
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

        },
      }}
    >
      <div ref={containerRef} />
    </Stack>
  );
};

export default DocxViewer;