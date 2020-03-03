const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = "token.json";

const authorize = async (callback, res) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URIS
  );

  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback, res);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, res);
    });
  });
};

const getAccessToken = async (oAuth2Client, callback, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  for await (const line of rl) {
    rl.question("Enter the code from that page here: ", async code => {
      rl.close();
      await oAuth2Client
        .getToken(code)
        .then(token => {
          res.cookie("GOOGLE_API_TOKEN", token.res.data);
          oAuth2Client.setCredentials(token.res.data);
          fs.writeFile(TOKEN_PATH, JSON.stringify(token.res.data), err => {
            if (err) return console.error(err);
          });
          callback(oAuth2Client, res);
        })
        .catch(err => console.error("Error retrieving access token", err));
    });
  }
};

const storeFiles = (auth, res) => {
  const drive = google.drive({ version: "v3", auth });
  var fileMetadata = {
    name: "test.pdf"
  };
  var media = {
    mimeType: "application/pdf",
    body: fs.createReadStream("pdfs/test.pdf")
  };

  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id"
    },
    (err, file) => {
      if (err) return console.error(err, "First");
      else {
        console.log("File Id: ", file.data.id);

        drive.permissions.create(
          {
            fileId: file.data.id,
            requestBody: { role: "reader", type: "anyone" }
          },
          err => {
            if (err) return console.log(err);
          }
        );

        drive.files.get(
          {
            fileId: file.data.id,
            fields: "webViewLink"
          },
          (err, response) => {
            if (err) return console.log(err);
            else {
              res.json("Successfully Uploaded");
              console.log("WebViewLink: ", response.data.webViewLink);
            }
          }
        );
      }
    }
  );
};

module.exports = {
  authorize,
  storeFiles
};
