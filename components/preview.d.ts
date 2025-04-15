declare module 'docx-preview' {
    export interface Options {
      className?: string;
      inWrapper?: boolean;
      ignoreWidth?: boolean;
      ignoreHeight?: boolean;
      ignoreFonts?: boolean;
      breakPages?: boolean;
      useBase64URL?: boolean;
      experimental?: boolean;
      trimXmlDeclaration?: boolean;
      debug?: boolean;
    }
  
    export function renderAsync(
      data: ArrayBuffer,
      container: HTMLElement,
      options?: Options
    ): Promise<void>;
  }
  