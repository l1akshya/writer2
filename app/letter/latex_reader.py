import os
import subprocess
from datetime import datetime

TEMPLATES_DIR = "writer2/Tempelates"
OUTPUT_DIR = "writer2/outputs"

def generate_pdf_from_template(template_file, placeholders):
    input_path = os.path.join(TEMPLATES_DIR, template_file)

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Template {template_file} not found in {TEMPLATES_DIR}")

    with open(input_path, "r", encoding="utf-8") as file:
        content = file.read()

    for key, value in placeholders.items():
        content = content.replace(key, value)

    tex_filename = f"cover_letter_{datetime.now().strftime('%Y%m%d_%H%M%S')}.tex"
    tex_path = os.path.join(OUTPUT_DIR, tex_filename)
    pdf_filename = tex_filename.replace(".tex", ".pdf")
    pdf_path = os.path.join(OUTPUT_DIR, pdf_filename)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(tex_path, "w", encoding="utf-8") as file:
        file.write(content)

    try:
        subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-output-directory", OUTPUT_DIR, tex_path],
            check=True,
            capture_output=True
        )
    except subprocess.CalledProcessError as e:
        print("Error during LaTeX compilation:", e.stderr.decode())

    return pdf_path
