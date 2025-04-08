declare module 'pdfjs-dist/build/pdf' {
  const getDocument: any;
  const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export { getDocument, GlobalWorkerOptions };
}

declare module 'pdfjs-dist/build/pdf.worker?url' {
  const workerUrl: string;
  export default workerUrl;
}
