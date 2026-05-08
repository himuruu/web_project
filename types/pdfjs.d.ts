declare module "pdfjs-dist" {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<any>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export function getDocument(source: { data: ArrayBuffer }): PDFDocumentLoadingTask;
  export const GlobalWorkerOptions: GlobalWorkerOptions;
}