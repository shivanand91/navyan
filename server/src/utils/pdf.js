import htmlPdfNode from "html-pdf-node";

export const generatePdfBufferFromHtml = async (html, optionOverrides = {}) => {
  const file = { content: html };
  const options = {
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      right: "10mm",
      bottom: "12mm",
      left: "10mm"
    },
    ...optionOverrides
  };

  const buffer = await htmlPdfNode.generatePdf(file, options);
  return buffer;
};
