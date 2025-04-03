import * as React from "react";
import { useEffect, useRef } from "react";
import * as docx from "docx-preview"; // Import as a module
import { Stack } from "@fluentui/react";

const DocxViewer: React.FC<{ docxUrl: string|undefined }> = ({ docxUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocx = async () => {
      //@ts-ignore
      const response = await fetch(docxUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      if (containerRef.current) {
        containerRef.current.innerHTML = ""; // Clear old content
        await docx.renderAsync(arrayBuffer, containerRef.current); // No need for third argument
      }
    };

    fetchDocx();
  }, [docxUrl]);

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
          // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          // borderRadius: "8px",
        },
      }}
    >
      <div ref={containerRef} />
    </Stack>
  );
};

export default DocxViewer;