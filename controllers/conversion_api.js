const axios = require("axios");
const pdfKit = require("pdfkit");
const fs = require("fs");
const { Document, Paragraph, TextRun, Packer } = require("docx");

const { authorize, storeFiles } = require("../uploadToDrive");

const convertAndUploadFile = (req, res) => {
  axios
    .get("https://jsonplaceholder.typicode.com/posts")
    .then(response => {
      const doc = new pdfKit({
        layout: "portrait",
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        info: {
          Title: "Convert to PDF",
          Author: "@Vicesoftware.com",
          Subject: "Uploading to Google Drive"
        }
      });

      doc.pipe(fs.createWriteStream("pdfs/test.pdf"));
      response.data.forEach(data => {
        doc.text(data.userId);
        doc.text(data.id);
        doc.text(data.title);
        doc.text(data.body);
      });
      doc.end();
    })
    .then(async () => {
      return await authorize(storeFiles, res);
    });
};

const convertAndSaveDocFile = (req, res) => {
  axios
    .get("https://jsonplaceholder.typicode.com/posts")
    .then(response => {
      const doc = new Document();

      response.data.forEach(data => {
        doc.addSection({
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: data.userId }).break(),
                new TextRun({ text: data.id }).break(),
                new TextRun({ text: data.title }).break(),
                new TextRun({ text: data.body }).break()
              ]
            })
          ]
        });
        Packer.toBuffer(doc).then(buffer => {
          fs.writeFileSync("TestDocument.docx", buffer);
        });
      });
    })
    .then(() => res.json("completed"));
};

module.exports = {
  convertAndUploadFile,
  convertAndSaveDocFile
};
