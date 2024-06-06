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
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('resumeFile'), (req, res) => {
  const filePath = req.file.path;
  const pythonScript = path.join(__dirname, 'resume_parser.py');
  const process = spawn('python3', [pythonScript, filePath]);

  let data = '';
  let errorData = '';

  process.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  process.stderr.on('data', (chunk) => {
    errorData += chunk.toString();
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      console.error(errorData);
      res.status(500).send('Error parsing resume');
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      console.error('Python script output:', data);
      res.status(500).send('Invalid JSON output from Python script');
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting uploaded file:', err);
      }
    });
  });
});

app.post('/upload', upload.single('resumeFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const filePath = req.file.path;
  console.log(`Received file: ${filePath}`);
  const pythonScript = path.join(__dirname, 'resume_parser.py');
  const process = spawn('python3', [pythonScript, filePath]);

  let data = '';
  let errorData = '';

  process.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  process.stderr.on('data', (chunk) => {
    errorData += chunk.toString();
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      console.error(errorData);
      res.status(500).send('Error parsing resume');
      return;
    }

    try {
      console.log('sending data to client')
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      console.error('Python script output:', data);
      res.status(500).send('Invalid JSON output from Python script');
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting uploaded file:', err);
      }
    });
  });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
