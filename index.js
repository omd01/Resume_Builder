const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const multer = require('multer');
const { spawn } = require('child_process');


app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
const templatePath = path.join(__dirname, "views/resume.ejs");

// Serve the HTML File
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


const upload = multer({ dest: 'uploads/' });


// Route to upload PDF and process it
app.post('/upload', upload.single('pdf'), (req, res) => {
  const pdfPath = req.file.path;
  // const pythonScript = path.join(__dirname, 'resume_parser.py');

  // const process = spawn('python', [pythonScript, pdfPath]);

  // let scriptOutput = '';
  // process.stdout.on('data', (data) => {
  //   scriptOutput += data.toString();
  // });

  // process.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // process.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  //   fs.unlink(pdfPath, (err) => {
  //     if (err) {
  //       console.error(err);
  //       return res.status(500).send('Error processing file');
  //     }
  //     res.send(scriptOutput);
  //   });
  // });
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
