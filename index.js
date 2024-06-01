const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/generate-resume', async (req, res) => {
    const { linkedinUrl } = req.body;

    try {
        // Fetch LinkedIn profile data
        const profileData = await fetchLinkedInData(linkedinUrl);

        // Render the profile data to an HTML template
        const resumeHtml = await renderHtml(profileData);

        // Generate PDF from the HTML
        const pdfBuffer = await generatePdf(resumeHtml);

        // Send the PDF as a response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf',
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function fetchLinkedInData(linkedinUrl) {
    // Here you can use LinkedIn API or web scraping techniques to fetch data.
    // For example, let's assume you have a function that scrapes LinkedIn profile:
    // return await scrapeLinkedInProfile(linkedinUrl);

    // Placeholder data for demonstration
    return {
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
}

async function renderHtml(profileData) {
    return new Promise((resolve, reject) => {
        app.render('resume', { profile: profileData }, (err, html) => {
            if (err) return reject(err);
            resolve(html);
        });
    });
}

async function generatePdf(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
