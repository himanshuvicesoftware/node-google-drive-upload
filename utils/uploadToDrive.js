const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { SCOPES, GOOGLE_API_TOKEN } = require("../utils/constants");

const authorize = async (callback, req, res) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URIS
  );

  if (req.cookies[GOOGLE_API_TOKEN]) {
    oAuth2Client.setCredentials(req.cookies[GOOGLE_API_TOKEN]);
    callback(oAuth2Client, req, res);
  } else return getAccessToken(oAuth2Client, callback, res);
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

  rl.question("Enter the code from that page here: ", async code => {
    rl.close();
    oAuth2Client
      .getToken(code)
      .then(token => {
        res.cookie(GOOGLE_API_TOKEN, token.res.data);
        oAuth2Client.setCredentials(token.res.data);
        callback(oAuth2Client, req, res);
      })
      .catch(err => console.error("Error retrieving access token", err));
  });
};

const storeFiles = (auth, req, res) => {
  const drive = google.drive({ version: "v3", auth });
  let fileMetadata = {
    name: `${req.body.fileName}.pdf`
  };
  let media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(`pdfs/${req.body.fileName}.pdf`)
  };

  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id"
    },
    (err, file) => {
      if (err) return console.error(err);
      else {
        drive.permissions.create(
          {
            fileId: file.data.id,
            requestBody: { role: "reader", type: "anyone" }
          },
          err => {
            if (err) return console.error(err);
            else {
              drive.files.get(
                {
                  fileId: file.data.id,
                  fields: "webViewLink"
                },
                (err, response) => {
                  if (err) return console.error(err);
                  else
                    res.send(
                      "Successfully uploaded the pdf file to google drive.\nGoogle Drive link to View PDF file: " +
                        response.data.webViewLink
                    );
                }
              );
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
