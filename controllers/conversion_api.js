const axios = require("axios");
const pdfKit = require("pdfkit");
const fs = require("fs");
const { Document, Paragraph, TextRun, Packer } = require("docx");
const { authorize, storeFiles } = require("../utils/uploadToDrive");
const path = require("path");

const convertAndUploadPdfFile = (req, res) => {
  const { filename, url } = req.body;
  axios
    .get(url)
    .then(async response => {
      const doc = new pdfKit({
        layout: "portrait",
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        info: {
          Title: "Convert to PDF",
          Author: "@Vicesoftware.com",
          Subject: "Uploading to Google Drive"
        }
      });

      await fs.promises
        .mkdir(path.join(__dirname, "../pdfs"), { recursive: true })
        .then(() => {
          doc.pipe(fs.createWriteStream(`pdfs/${filename}.pdf`));
        })
        .catch(err => console.error(err));

      response.data.forEach(data => {
        doc.text(data.userId);
        doc.text(data.id);
        doc.text(data.title);
        doc.text(data.body);
      });
      doc.end();
    })
    .then(() => authorize(storeFiles, req, res));
};

const convertAndSaveDocFile = (req, res) => {
  const { filename, url } = req.body;
  axios.get(url).then(response => {
    const doc = new Document();

    response.data.forEach(data => {
      doc.addSection({
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
    });
    Packer.toBuffer(doc)
      .then(async buffer => {
        await fs.promises
          .mkdir(path.join(__dirname, "../docs"), { recursive: true })
          .then(() => fs.writeFileSync(`docs/${filename}.docx`, buffer));
        res.send("Successfully converted to doc file.");
      })
      .catch(err => {
        console.error(err);
        res.send("Failed in converting to doc file.");
      });
  });
};

module.exports = {
  convertAndUploadPdfFile,
  convertAndSaveDocFile
};
