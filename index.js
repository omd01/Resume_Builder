const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const multer = require('multer');

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
const templatePath = path.join(__dirname, "views/template.ejs");

// Serve the HTML form
app.get("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/formdata", async (req, res) => {
  try {
    await createPDF(req.body, res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

async function createPDF(userData, res) {
  fs.readFile(templatePath, "utf-8", async (err, template) => {
    if (err) {
      console.error("Error reading the template file:", err);
      return;
    }

    // Render the EJS template with data
    const htmlContent = ejs.render(template, userData);

    let browser;
    try {
      console.log("Launching browser...");
      browser = await puppeteer.launch({
        headless: true,
        timeout: 60000, // 60 seconds
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      console.log("Browser launched. Opening new page...");
      const page = await browser.newPage();

      console.log("Setting navigation timeout...");
      await page.setDefaultNavigationTimeout(60000); // 60 seconds

      console.log("Setting content...");
      // Set the content of the page
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      console.log("Creating PDF directory...");
      const outputDir = path.join(__dirname, "pdf");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir); // Create the directory if it doesn't exist
      }

      console.log("Generating PDF...");
      const pdfPath = path.join(outputDir, `${userData.name}.pdf`);
      await page.pdf({ path: pdfPath, format: "A4" });

      console.log(`PDF created successfully at ${pdfPath}`);

      console.log("Closing browser...");
      await browser.close();

      console.log("Sending PDF...");
      await sendPDF(userData, res);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  });
}

async function sendPDF(userData, res) {
  console.log("in function Sending PDF...");
  const filePath = path.join(__dirname, "/pdf", userData.name + ".pdf");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + userData.name + ".pdf"
    );
    res.send(data);
    console.log("PDF sent successfully", filePath);
  });
}

// get pdf and send data 

// Create the /client-pdf folder if it doesn't exist
const uploadDir = path.join(__dirname, 'client-pdf');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Handle the file upload
app.post('/getpdftoserver', upload.single('pdfFile'), (req, res) => {
    if (req.file) {
        res.status(200).send('File uploaded successfully.');
    } else {
        res.status(400).send('Failed to upload file.');
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
