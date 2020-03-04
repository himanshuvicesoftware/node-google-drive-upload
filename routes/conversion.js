module.exports = app => {
  var conversion = require("../controllers/conversion_api");

  app.route("/").get((req, res) => {
    res.json({ message: `This is a node test app.` });
  });

  app.route("/cookies").get((req, res) => {
    res.send(req.cookies);
  });
  app.route("/pdf").post(conversion.convertAndUploadPdfFile);
  app.route("/doc").post(conversion.convertAndSaveDocFile);
};
