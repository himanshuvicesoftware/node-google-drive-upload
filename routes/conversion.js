module.exports = app => {
  var conversion = require("../controllers/conversion_api");

  app.route("/pdf").get(conversion.convertAndUploadFile);
  app.route("/doc").get(conversion.convertAndSaveDocFile);
};
