const express = require("express");
const multer = require("multer");
const { Rembg } = require("rembg-node");
const sharp = require("sharp");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function removeBg(image, blurValue) {
  // Process the image

  const rembg = new Rembg();

  const input = sharp(image.buffer);
  const output = await (
    await rembg.remove(input)
  )
    .blur(blurValue)
    .png({
      compressionLevel: 9,
      quality: 100,
    })
    // .trim()
    .toBuffer();

  return output;
}

const upload = multer();
// Express route handler
app.post("/remove", upload.single("image"), async (req, res) => {
  const { blur = "0.3" } = req.query;

  try {
    // Get the blur value from the client (assuming it's sent in the request)
    const blurValue = parseFloat(blur) || 0.3;

    // Use your AppService to perform image processing
    const process = await removeBg(req.file, blurValue);

    // Set response headers
    res.setHeader("Cache-Control", "none");
    res.setHeader("Keep-Alive", "timeout=10");

    // Send the response
    res.status(200).json(process);
  } catch (error) {
    // Handle errors
    res.status(400).json({
      message: "An error occurred during image processing",
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
