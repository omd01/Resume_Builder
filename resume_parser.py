import sys
import pytesseract
from PIL import Image
import pdf2image
import re
import json

pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'

def pdf_to_images(pdf_path):
    try:
        images = pdf2image.convert_from_path(pdf_path)
        return images
    except Exception as e:
        print(json.dumps({"error": f"Error converting PDF to images: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

def ocr_images(images):
    text = ''
    try:
        for image in images:
            text += pytesseract.image_to_string(image)
    except Exception as e:
        print(json.dumps({"error": f"Error performing OCR on images: {str(e)}"}), file=sys.stderr)
        sys.exit(1)
    return text

def parse_resume_text(text):
    try:
        resume_info = {}
        name_match = re.search(r'^(.*)', text)
        email_match = re.search(r'(\S+@\S+)', text)
        phone_match = re.search(r'(\+?\d[\d -]{7,}\d+)', text)
        education_match = re.search(r'Education\s+(.*?)(?=Experience)', text, re.DOTALL | re.IGNORECASE)
        experience_match = re.search(r'Experience\s+(.*?)(?=Projects)', text, re.DOTALL | re.IGNORECASE)
        projects_match = re.search(r'Projects\s+(.*?)(?=Technical Skills)', text, re.DOTALL | re.IGNORECASE)
        skills_match = re.search(r'Technical Skills\s+(.*?)(?=Certifications)', text, re.DOTALL | re.IGNORECASE)
        certifications_match = re.search(r'Certifications\s+(.*?)(?=Publications)', text, re.DOTALL | re.IGNORECASE)
        publications_match = re.search(r'Publications\s+(.*)', text, re.DOTALL | re.IGNORECASE)

        resume_info['name'] = name_match.group(1).strip() if name_match else 'N/A'
        resume_info['email'] = email_match.group(1).strip() if email_match else 'N/A'
        resume_info['phone'] = phone_match.group(1).strip() if phone_match else 'N/A'
        resume_info['education'] = education_match.group(1).strip() if education_match else 'N/A'
        resume_info['experience'] = experience_match.group(1).strip() if experience_match else 'N/A'
        resume_info['projects'] = projects_match.group(1).strip() if projects_match else 'N/A'
        resume_info['skills'] = skills_match.group(1).strip() if skills_match else 'N/A'
        resume_info['certifications'] = certifications_match.group(1).strip() if certifications_match else 'N/A'
        resume_info['publications'] = publications_match.group(1).strip() if publications_match else 'N/A'

        return resume_info
    except Exception as e:
        print(json.dumps({"error": f"Error parsing resume text: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    try:
        images = pdf_to_images(pdf_path)
        resume_text = ocr_images(images)
        parsed_info = parse_resume_text(resume_text)
        print(json.dumps(parsed_info))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
