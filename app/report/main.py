import os
import subprocess
from typing import List
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

# Paths
TEMPLATE_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\Tempelates"
OUTPUT_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\outputs"

# Default placeholders
REPORT_PLACEHOLDERS = {
    "PlaceHolderTitle": "Document Title",
    "PlaceHolderAuthorName": "Author Name",
    "PlaceHolderDepartmentName": "Department Name",
    "PlaceHolderOrganizationName": "Organization Name",
    "PlaceHolderCity": "City",
    "PlaceHolderCountry": "Country",
    "PlaceHolderEmail": "Email Address"
}


class AuthorInfo(BaseModel):
    name: str
    department: str
    organization: str
    city: str
    country: str
    email: str


class ReportTemplateData(BaseModel):
    template_name: str
    title: str
    abstract: str
    index_terms: str
    introduction: str
    authors: List[AuthorInfo]
    output_filename: str


@app.get("/")
async def root():
    return {"message": "LaTeX Report Template Processing API is running on port 8002"}


@app.get("/report-templates")
async def list_templates():
    """List available templates"""
    if not os.path.isdir(TEMPLATE_FOLDER):
        raise HTTPException(status_code=404, detail="Template folder not found")

    files = [f for f in os.listdir(TEMPLATE_FOLDER) if f.endswith((".tex", ".txt"))]
    if not files:
        raise HTTPException(status_code=404, detail="No templates found")

    return {i + 1: f for i, f in enumerate(files)}


@app.get("/report-placeholders")
async def get_placeholders():
    return {"report_info": REPORT_PLACEHOLDERS}

def generate_authors_latex(authors):
    """
    Generate LaTeX authors block for IEEEtran conference template.
    Arranged in 2 rows × 3 columns using minipages.
    Supports 1–6 authors.
    """
    if not authors:
        return ""

    author_blocks = []

    # Fill missing authors with empty dicts to make 6 total
    authors_full = authors + [{} for _ in range(6 - len(authors))]

    # Split into 2 rows of 3
    rows = [authors_full[:3], authors_full[3:]]

    for row in rows:
        row_block = []
        for author in row:
            if author:  # Check if author dict is not empty
                # Access as object attributes, not dictionary keys
                block = (
                    r"\begin{minipage}[t]{0.32\textwidth}" + "\n"
                    r"\centering" + "\n"
                    r"\textbf{" + author.name + r"}\\" + "\n"
                    r"\textit{" + author.department + r"}\\" + "\n"
                    r"\textit{" + author.organization + r"}\\" + "\n"
                    + author.city + ", " + author.country + r"\\" + "\n"
                    + author.email + "\n"
                    r"\end{minipage}"
                )
            else:
                # empty block for missing authors
                block = r"\begin{minipage}[t]{0.32\textwidth}\end{minipage}"
            row_block.append(block)
        # Join the 3 minipages horizontally with \hfill
        author_blocks.append(" \hfill ".join(row_block))

    # Join the 2 rows with \\[1em] for vertical spacing
    final_authors_block = r"\author{" + "\n\\\\[1em]\n".join(author_blocks) + "\n}"
    return final_authors_block

def find_author_block_bounds(latex_code: str) -> tuple:
    """Find the start and end positions of the \\author{...} block"""
    # Look for \author{ (with actual backslash)
    search_str = "\\author{"
    author_start = latex_code.find(search_str)
    
    if author_start == -1:
        return None, None
    
    # Find matching closing brace
    brace_count = 0
    i = author_start + len(search_str) - 1  # Start at the opening brace
    
    while i < len(latex_code):
        if latex_code[i] == '{':
            brace_count += 1
        elif latex_code[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                return author_start, i + 1
        i += 1
    
    return None, None


@app.post("/generate-report-pdf")
async def generate_report_pdf(template_data: ReportTemplateData):
    """Generate PDF using a LaTeX template"""
    template_path = os.path.join(TEMPLATE_FOLDER, template_data.template_name)
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")

    if not template_data.authors:
        raise HTTPException(status_code=400, detail="At least one author is required")

    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    try:
        # Read LaTeX template with explicit encoding
        with open(template_path, "r", encoding="utf-8") as f:
            latex_code = f.read()

        # Replace title
        modified_code = latex_code.replace("PlaceHolderTitle", template_data.title)
        
        # Replace abstract
        modified_code = modified_code.replace("PlaceHolderAbstract", template_data.abstract)
        
        # Replace index terms
        modified_code = modified_code.replace("PlaceHolderIndexTerms", template_data.index_terms)
        
        # Replace introduction
        modified_code = modified_code.replace("PlaceHolderIntroduction", template_data.introduction)

        # Generate author section dynamically
        authors_section = generate_authors_latex(template_data.authors)
        
        print("=" * 50)
        print("Generated authors section:")
        print(authors_section)
        print("=" * 50)

        # Find and replace the author block
        start_pos, end_pos = find_author_block_bounds(modified_code)
        
        if start_pos is not None and end_pos is not None:
            print(f"Found author block at positions {start_pos} to {end_pos}")
            # Replace the author block
            modified_code = modified_code[:start_pos] + authors_section + modified_code[end_pos:]
        else:
            print("No author block found, inserting before \\maketitle")
            # If no author block found, insert before \maketitle
            maketitle_pos = modified_code.find("\\maketitle")
            if maketitle_pos != -1:
                modified_code = modified_code[:maketitle_pos] + authors_section + "\n\n" + modified_code[maketitle_pos:]
            else:
                raise HTTPException(status_code=500, detail="Could not find insertion point for authors")

        # Write temporary .tex file
        output_filename = template_data.output_filename
        if not output_filename.endswith(".pdf"):
            output_filename += ".pdf"

        tex_path = os.path.join(OUTPUT_FOLDER, output_filename.replace(".pdf", ".tex"))
        
        # Write with explicit UTF-8 encoding
        with open(tex_path, "w", encoding="utf-8", newline='\n') as f:
            f.write(modified_code)
        
        print(f"Wrote .tex file to: {tex_path}")

        # Compile PDF twice for references
        for run in range(2):
            print(f"Running pdflatex (pass {run + 1})...")
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", OUTPUT_FOLDER, tex_path],
                capture_output=True,
                text=True,
                check=False
            )
            
            if result.returncode != 0:
                # Log the error for debugging
                log_path = tex_path.replace(".tex", "_error.log")
                with open(log_path, "w", encoding="utf-8") as log_file:
                    log_file.write("STDOUT:\n")
                    log_file.write(result.stdout)
                    log_file.write("\n\nSTDERR:\n")
                    log_file.write(result.stderr)
                print(f"LaTeX compilation error. Log saved to: {log_path}")

        pdf_path = os.path.join(OUTPUT_FOLDER, output_filename)
        if not os.path.exists(pdf_path):
            raise HTTPException(
                status_code=500, 
                detail="PDF not generated. Check LaTeX errors in the error log file in the outputs folder."
            )

        # Clean up auxiliary files
        for ext in [".aux", ".log", ".out"]:
            file = tex_path.replace(".tex", ext)
            if os.path.exists(file):
                try:
                    os.remove(file)
                except:
                    pass

        print(f"PDF generated successfully: {pdf_path}")
        return {"message": "Report PDF generated successfully", "path": pdf_path}

    except Exception as e:
        print(f"Error in generate_report_pdf: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8002, reload=True)