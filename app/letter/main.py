import os
import subprocess
from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Added 127.0.0.1
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Paths
TEMPLATE_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\Tempelates"
OUTPUT_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\outputs"

# Cover Letter placeholders
COVER_LETTER_PLACEHOLDERS = {
    "PlaceHolderName": "Full Name",
    "PlaceHolderAddress": "Street Address",
    "PlaceHolderCityStateZip": "City, State, ZIP",
    "PlaceHolderPhone": "Phone Number",
    "PlaceHolderEmail": "Email Address",
    "PlaceHolderHiringManagerName": "Hiring Manager Name",
    "PlaceHolderCompanyName": "Company Name",
    "PlaceHolderCompanyAddress": "Company Address",
    "PlaceHolderCompanyCityStateZip": "Company City, State, ZIP",
    "PlaceHolderPositionTitle": "Position Title",
    "PlaceHolderDate": "Date",
    "PlaceHolderBody": "Letter Body"
}

# Cover Letter Model
class CoverLetterData(BaseModel):
    template_name: str
    cover_letter_data: Dict[str, str]
    output_filename: str

@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"message": "Cover Letter Generator API is running"}

@app.get("/templates")
async def list_templates():
    """Lists all available LaTeX templates."""
    if not os.path.isdir(TEMPLATE_FOLDER):
        raise HTTPException(status_code=404, detail="Template folder not found")
    
    text_files = [f for f in os.listdir(TEMPLATE_FOLDER) if f.endswith(".txt")]
    
    if not text_files:
        raise HTTPException(status_code=404, detail="No templates found")
    
    return {i + 1: file for i, file in enumerate(text_files)}

@app.get("/placeholders")
async def get_placeholders():
    """Returns all available placeholders for cover letters."""
    return {
        "cover_letter": COVER_LETTER_PLACEHOLDERS
    }

@app.post("/generate-cover-letter")
async def generate_cover_letter(cover_letter_data: CoverLetterData):
    """Generates a cover letter PDF from a template with provided data."""
    template_path = os.path.join(TEMPLATE_FOLDER, cover_letter_data.template_name)
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    
    try:
        # Read the template
        with open(template_path, "r", encoding="utf-8") as f:
            latex_code = f.read()
        
        modified_code = latex_code
        
        # Replace all cover letter placeholders
        for placeholder, value in cover_letter_data.cover_letter_data.items():
            if placeholder in modified_code:
                modified_code = modified_code.replace(placeholder, value)
        
        # Ensure output directory exists
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        
        # Create output filename
        output_filename = cover_letter_data.output_filename
        if not output_filename.endswith('.pdf'):
            output_filename += '.pdf'
        
        # Create temporary tex file
        tex_file_path = os.path.join(OUTPUT_FOLDER, output_filename.replace(".pdf", ".tex"))
        with open(tex_file_path, "w", encoding="utf-8") as f:
            f.write(modified_code)
        
        # Generate PDF using pdflatex
        process = subprocess.run(
            ["pdflatex", "-output-directory", OUTPUT_FOLDER, tex_file_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Verify PDF was created
        pdf_path = os.path.join(OUTPUT_FOLDER, output_filename)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
        
        # Clean up auxiliary files
        for ext in ['.aux', '.log']:
            aux_file = os.path.join(OUTPUT_FOLDER, output_filename.replace('.pdf', ext))
            if os.path.exists(aux_file):
                os.remove(aux_file)
        
        return {
            "message": "Cover letter PDF generated successfully",
            "path": pdf_path,
            "filename": output_filename
        }
        
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"LaTeX compilation failed: {e.stderr}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating cover letter PDF: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)