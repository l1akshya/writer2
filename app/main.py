import os
import subprocess
from typing import Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Original paths
TEMPLATE_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\Tempelates"
OUTPUT_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\outputs"

# Original placeholders with education section separated
BASIC_PLACEHOLDERS = {
    "Place_Holder_Name": "Name",
    "Place_Holder_contact": "Contact Number",
    "Place_Holder_Mail": "Email",
    "Place_Holder_linkedin": "LinkedIn Profile",
    "Place_Holder_github": "GitHub Profile",
}

EDUCATION_PLACEHOLDERS = {
    "PlaceHolderEducation": "\\parbox{8cm}{Education Institute}",
    "PlaceHolderCourse": "\\parbox{8cm}{Course Undertaken}",
    "PlaceHolderScore": "\\parbox{8cm}{Percentage/GPA}",
    "PlaceHolderLocation1": "\\parbox{8cm}{Location of Institute}",
    "PlaceHolderStartMonth": "\\makebox[2cm][l]{Start Month}",
    "PlaceHolderStartYear": "\\makebox[2cm][l]{Start Year}",
    "PlaceHolderEndMonth": "\\makebox[2cm][l]{End Month}",
    "PlaceHolderEndYear": "\\makebox[2cm][l]{End Year}"
}

EXPERIENCE_PLACEHOLDERS = {
    "PlaceHolderExperiencePosition1": "Position Title",
    "PlaceHolderExperiencePositionCompany": "Company Name",
    "PlaceHolderExperiencePositionLocation": "Location",
    "PlaceHolderExperiencePositionStartMonth": "Start Month",
    "PlaceHolderExperiencePositionStartYear": "Start Year",
    "PlaceHolderExperiencePositionEndMonth": "End Month",
    "PlaceHolderExperiencePositionEndYear": "End Year",
    "PlaceHolderExpeienceItem1": "Experience Description"
}


PROJECT_PLACEHOLDERS = {
    "PlaceHolderProjectTitle": "Project Title",
    "PlaceHolderProjectTool1": "Project Tools",
    "PlaceHolderProjectStartMonth": "Start Month",
    "PlaceHolderProjectStartYear": "Start Year",
    "PlaceHolderProjectEndMonth": "End Month",
    "PlaceHolderProjectEndYear": "End Year",
    "PlaceHolderProjectItem1": "Project Description"
}

class EducationEntry(BaseModel):
    education: str
    course: str
    location: str
    startMonth: str
    startYear: str
    endMonth: str
    endYear: str
    score:str
    isPresent: bool = False  # Added isPresent field with default value False

class ExperienceItem(BaseModel):
    description: str

class ExperienceEntry(BaseModel):
    position: str
    company: str
    location: str
    startMonth: str
    startYear: str
    endMonth: str
    endYear: str
    isPresent: bool = False
    items: List[ExperienceItem]


class ProjectItem(BaseModel):
    description: str

class ProjectEntry(BaseModel):
    title: str
    tools: str
    startMonth: str
    startYear: str
    endMonth: str
    endYear: str
    isPresent: bool = False
    items: List[ProjectItem]

class TemplateData(BaseModel):
    template_name: str
    basic_info: Dict[str, str]
    education_entries: List[EducationEntry]
    experience_entries: List[ExperienceEntry]
    project_entries:List[ProjectEntry]
    output_filename: str

@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"message": "LaTeX Template Processing API is running"}

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
    """Returns all available placeholders."""
    return {
        "basic_info": BASIC_PLACEHOLDERS,
        "education": EDUCATION_PLACEHOLDERS,
        "experience": EXPERIENCE_PLACEHOLDERS,
        "project": PROJECT_PLACEHOLDERS
    }

def generate_education_latex(entries: List[EducationEntry]) -> str:
    """
    Generates LaTeX code for multiple education entries.
    Handles 'Present' status for current education.
    """
    latex_entries = []
    for entry in entries:
        # Format the date range based on isPresent flag
        if entry.isPresent:
            date_range = f"{entry.startMonth} {entry.startYear} -- Present"
        else:
            date_range = f"{entry.startMonth} {entry.startYear} -- {entry.endMonth} {entry.endYear}"
            
        latex_entry = (
            f"    \\resumeEducation\n"
            f"      {{{entry.education}}}\n"
            f"      {{{entry.location}}}\n"
            f"      {{{entry.course}}}\n"
            f"      {{{date_range}}}\n"
            f"      {{{entry.score}}}"
        )
        latex_entries.append(latex_entry)
    
    return "\\resumeSubHeadingListStart\n" + "\n".join(latex_entries) + "\n\\resumeSubHeadingListEnd"


def generate_experience_latex(entries: List[ExperienceEntry]) -> str:
    """Generates LaTeX code for multiple experience entries."""
    latex_entries = []
    for entry in entries:
        date_range = f"{entry.startMonth} {entry.startYear} -- {'Present' if entry.isPresent else f'{entry.endMonth} {entry.endYear}'}"
        
        # Create the experience items list
        items_latex = "      \\resumeItemListStart\n"
        for item in entry.items:
            items_latex += f"        \\resumeItem{{{item.description}}}\n"
        items_latex += "      \\resumeItemListEnd"
        
        latex_entry = (
            f"    \\resumeSubheading\n"
            f"      {{{entry.position}}}{{{date_range}}}\n"
            f"      {{{entry.company}}}{{{entry.location}}}\n"
            f"{items_latex}"
        )
        latex_entries.append(latex_entry)
    
    return "\\resumeSubHeadingListStart\n" + "\n".join(latex_entries) + "\n\\resumeSubHeadingListEnd"


def generate_project_latex(entries: List[ProjectEntry]) -> str:
    """Generates LaTeX code for multiple project entries."""
    latex_entries = []
    for entry in entries:
        date_range = f"{entry.startMonth} {entry.startYear} -- {'Present' if entry.isPresent else f'{entry.endMonth} {entry.endYear}'}"
        
        # Create the project items list
        items_latex = "          \\resumeItemListStart\n"
        for item in entry.items:
            items_latex += f"            \\resumeItem{{{item.description}}}\n"
        items_latex += "          \\resumeItemListEnd"
        
        latex_entry = (
            f"      \\resumeProjectHeading\n"
            f"          {{\\textbf{{{entry.title}}} $|$ \\emph{{{entry.tools}}}}}{{{date_range}}}\n"
            f"{items_latex}"
        )
        latex_entries.append(latex_entry)
    
    return "    \\resumeSubHeadingListStart\n" + "\n".join(latex_entries) + "\n    \\resumeSubHeadingListEnd"

@app.post("/generate-pdf")
async def generate_pdf(template_data: TemplateData):
    """Generates a PDF from a template with provided data."""
    # Validate template exists
    template_path = os.path.join(TEMPLATE_FOLDER, template_data.template_name)
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    try:
        # Read template
        with open(template_path, "r", encoding="utf-8") as f:
            latex_code = f.read()
        
        # Replace basic info placeholders
        modified_code = latex_code
        for placeholder, value in template_data.basic_info.items():
            if placeholder in BASIC_PLACEHOLDERS:
                modified_code = modified_code.replace(placeholder, value)
        
        # Replace education section
        education_pattern = (
            "\\resumeSubHeadingListStart\n"
            "    \\resumeEducation\n"
            "      {PlaceHolderEducation}\n"
            "      {PlaceHolderLocation1}\n"
            "      {PlaceHolderCourse}\n"
            "      {PlaceHolderStartMonth PlaceHolderStartYear -- PlaceHolderEndMonth PlaceHolderEndYear}\n"
            "      {PlaceHolderScore}\n"
            "\\resumeSubHeadingListEnd"
        )
        education_section = generate_education_latex(template_data.education_entries)
        modified_code = modified_code.replace(education_pattern, education_section)
        
        # Replace experience section
        experience_pattern = (
            "  \\resumeSubHeadingListStart\n"
            "    \\resumeSubheading\n"
            "      {PlaceHolderExperiencePosition1}{PlaceHolderExperiencePositionStartMonth PlaceHolderExperiencePositionStartYear -- PlaceHolderExperiencePositionEndMonth PlaceHolderExperiencePositionStartYear}\n"
            "      {PlaceHolderExperiencePositionCompany}{PlaceHolderExperiencePositionLocation}\n"
            "      \\resumeItemListStart\n"
            "        \\resumeItem{PlaceHolderExperienceItem1}\n"
            "      \\resumeItemListEnd\n"
            "  \\resumeSubHeadingListEnd"
        )
        experience_section = generate_experience_latex(template_data.experience_entries)
        modified_code = modified_code.replace(experience_pattern, experience_section)

        project_pattern = (
            "    \\resumeSubHeadingListStart\n"
            "      \\resumeProjectHeading\n"
            "          {\\textbf{PlaceHolderProjectTitle} $|$ \\emph{PlaceHolderProjectTool1}}{PlaceHolderProjectStartMonth PlaceHolderProjectStartYear -- PlaceHolderProjectEndMonth PlaceHolderProjectEndYear}\n"
            "          \\resumeItemListStart\n"
            "            \\resumeItem{PlaceHolderProjectItem1}\n"
            "          \\resumeItemListEnd\n"
            "    \\resumeSubHeadingListEnd"
        )
        project_section = generate_project_latex(template_data.project_entries)
        print(project_section)
        modified_code = modified_code.replace(project_pattern, project_section)

        # Ensure output directory exists
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        
        # Create output filename
        output_filename = template_data.output_filename
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
            "message": "PDF generated successfully",
            "path": pdf_path
        }
        
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"LaTeX compilation failed: {e.stderr}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)