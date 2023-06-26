const express = require('express')
const app = express();
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const port = 3000


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/audio/upload", async (req, res) => {
  // Get the file name and extension with multer
  const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      const fileExt = file.originalname.split(".").pop();
      const filename = `${new Date().getTime()}.${fileExt}`;
      cb(null, filename);
    },
  });

  // Filter the file to validate if it meets the required audio extension
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
      cb(null, true);
    } else {
      cb(
        {
          message: "Unsupported File Format",
        },
        false
      );
    }
  };

  // Set the storage, file filter and file size with multer
  const upload = multer({
    storage,
    limits: {
      fieldNameSize: 2000,
      fileSize: 50 * 1200 * 1200,
    },
    fileFilter,
  }).single("audio");
  //El nombre que pongamos aquí, ahora mismo tenemos audio, es el mismo que debe ir dentro del name del form. Para más información mirar aqui => https://stackoverflow.com/questions/31530200/node-multer-unexpected-field
  // upload to cloudinary
  upload(req, res, (err) => {
    if (err) {
      return res.send(err);
    }

    // SEND FILE TO CLOUDINARY
    cloudinary.config({
      cloud_name: YOUR_CLOUDINARY_NAME_HERE,
      api_key: YOUR_CLOUDINARY_APIKEY_HERE,
      api_secret: YOUR_CLOUDINARY_SECRET_HERE,
    });
    const { path } = req.file; // file becomes available in req at this point

    const fName = req.file.originalname.split(".")[0];
    cloudinary.uploader.upload(
      path,
      {
        resource_type: "raw",
        public_id: `AudioUploads/${fName}`,
      },

      // Send cloudinary response or catch error
      (err, audio) => {
        if (err) return res.send(err);

        fs.unlinkSync(path);
        res.send(audio);
      }
    );
  });
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


/*
RESPUESTA DEL CÓDIGO

{
    "asset_id": "75efe443dcee87efe9493f61df8e22f9",
    "public_id": "AudioUploads/confetti.mp3",
    "version": 1632982994,
    "version_id": "c1d4b2f1173a1ea1d25aa721de69e101",
    "signature": "9c7114ce695432cfaa063dbe2bdf5672a0616e68",
    "resource_type": "raw",
    "created_at": "2021-09-30T06:23:14Z",
    "tags": [],
    "bytes": 43014,
    "type": "upload",
    "etag": "e56a0699465bd43c4484f76833070ef7",
    "placeholder": false,
    "url": "http://res.cloudinary.com/dzzpwrdae/raw/upload/v1632982994/AudioUploads/confetti.mp3",
    "secure_url": "https://res.cloudinary.com/dzzpwrdae/raw/upload/v1632982994/AudioUploads/confetti.mp3",
    "original_filename": "1632982993482",
    "api_key": "379299498844814"
}

*/