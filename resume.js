const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Data to inject into the template 1
const data1 = {
  name: "Sahil Vichare temp",
  title: "Software Developer",
  phone: "+91 72002 34883",
  email: "sahilvichare81@gmail.com",
  github: "#",
  location: "Yerwada, Pune",
  linkedin: "#",
  leetcode: "#",
  summary:
    "Highly skilled and detail-oriented software developer with 2 years of experience designing, developing, and deploying enterprise-level applications. Proficient in multiple programming languages, software development methodologies, and database management systems. Strong problem-solving skills and ability to work effectively in a team-based environment.",
  skills: {
    soft: ["Public Speaking", "Leadership", "Critical thinking", "Team work"],
    hard: [
      "Problem Solving",
      "Intermediate Coding",
      "Object Oriented Programming",
      "Application Development",
    ],
    technology: [
      "HTML",
      "CSS",
      "Javascript",
      "Google Cloud",
      "React.js",
      "Advance Node.js",
      "MongoDB",
      "MySQL",
    ],
  },
  internships: [
    {
      name: "Edunet Foundation (IBM Skills Build)",
      position: "IBM Cloud and Artificial Intelligence",
      duration: "Jan 2024 - Feb 2024",
      description:
        "During my internship at Edunet Foundation, I gained practical experience in machine learning and artificial intelligence projects. I worked on data preprocessing, model development, and algorithm refinement under the guidance of IBM professionals. This experience enhanced my skills and understanding of these technologies, preparing me for future challenges in the field.",
    },
  ],
  experience: [
    {
      position: "Postman Campus Leader",
      company: "Postman",
      duration: "Jan 2024 - Present",
      badgeLink: "#",
      description:
        "Building RESTful APIs (Node.js) from scratch, Testing, Staging and Deploying them on different cloud service providers. Implementing Unit Testing, also hosting informative and tech events based on APIs and Node.js to teach the students and spread API literacy.",
    },
    {
      position: "MERN Stack",
      company: "",
      duration: "",
      badgeLink: "",
      description:
        "Experienced in MERN stack with 5+ full-stack projects and relevant certifications. Actively participated in Hackathons and collaborative team projects, demonstrating proficiency in project development and problem-solving. Versatile skill set encompasses MongoDB, Express.js, React.js, and Node.js, poised for dynamic contributions in web development endeavors.",
    },
  ],
  projects: [
    {
      name: null,
      technology: "(React.js, Advance Node.js, MongoDB)",
      description:
        "Project facilitates knowledge sharing & career guidance among students. Incorporates strong user interaction and efficient doubt resolution.",
    },
    {
      name: "Password Manager App",
      technology: "(Advance Node.js, MongoDB, Cryptography)",
      description:
        "Password management project ensures secure storage using cryptography, bcrypt encryption, and decryption methods for enhanced data protection and user privacy.",
    },
    {
      name: "3 Professional Landing Pages",
      technology: "(Advance React.js, HTML, CSS, and Javascript)",
      description: "",
    },
  ],
  education: {
    degree: null,
    institution: "MES Wadia College of Engineering, Pune",
    duration: "2021-2025",
  },
};


// Read the EJS template file
const templatePath = path.join(__dirname, "views/resume.ejs");

function createPDF(data) {
  fs.readFile(templatePath, "utf-8", async (err, template) => {
    if (err) {
      console.error("Error reading the template file:", err);
      return;
    }

    // Render the EJS template with data
    const htmlContent = ejs.render(template, data);

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
      const pdfPath = path.join(outputDir, `${data.name}.pdf`);
      await page.pdf({ path: pdfPath, format: "A4" });

      console.log(`PDF created successfully at ${pdfPath}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      if (browser) {
        console.log("Closing browser...");
        await browser.close();
      }
    }
  });
}

createPDF(data1);