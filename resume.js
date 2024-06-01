const ejs = require('ejs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Data to inject into the template
const data = {
    name: 'John Doe',
    headline: 'Software Engineer',
    summary: 'Experienced software engineer with a passion for developing innovative programs...',
    experience: [
        {
            title: 'Senior Software Engineer',
            company: 'Tech Company',
            dates: 'Jan 2020 - Present',
            description: 'Developing and maintaining web applications...'
        },
        // Add more experience
    ],
    education: [
        {
            school: 'University of Somewhere',
            degree: 'Bachelor of Science in Computer Science',
            dates: '2015 - 2019'
        }
        // Add more education
    ],
    skills: ['JavaScript', 'Node.js', 'React', 'CSS']
};

// Read the EJS template file
const templatePath = path.join(__dirname, 'template.ejs');
fs.readFile(templatePath, 'utf-8', async (err, template) => {
  if (err) {
    console.error('Error reading the template file:', err);
    return;
  }

  // Render the EJS template with data
  const htmlContent = ejs.render(template, data);

  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      timeout: 60000, // 60 seconds
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched. Opening new page...');
    const page = await browser.newPage();

    console.log('Setting navigation timeout...');
    await page.setDefaultNavigationTimeout(60000); // 60 seconds

    console.log('Setting content...');
    // Set the content of the page
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 60000 });

    console.log('Creating PDF directory...');
    const outputDir = path.join(__dirname, 'pdf');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir); // Create the directory if it doesn't exist
    }

    console.log('Generating PDF...');
    const pdfPath = path.join(outputDir, `${data.name}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4' });

    console.log(`PDF created successfully at ${pdfPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
});
