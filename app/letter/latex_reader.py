import os
import subprocess

PLACEHOLDERS = {
    "PlaceHolderName": "Enter your full name: ",
    "PlaceHolderAddress": "Enter your street address: ",
    "PlaceHolderCityStateZip": "Enter your city, state, and ZIP: ",
    "PlaceHolderPhone": "Enter your phone number: ",
    "PlaceHolderEmail": "Enter your email address: ",
    "PlaceHolderHiringManagerName": "Enter hiring manager's name: ",
    "PlaceHolderCompanyName": "Enter company name: ",
    "PlaceHolderCompanyAddress": "Enter company address: ",
    "PlaceHolderCompanyCityStateZip": "Enter company city, state, and ZIP: ",
    "PlaceHolderPositionTitle": "Enter position title: ",
    "PlaceHolderDate": "Enter date (e.g., January 15, 2025): ",
    "PlaceHolderBody": "Enter cover letter body (press Enter twice when done):\n"
}

def list_text_files(folder_path):
    """Lists and numbers all text files in the given folder path."""
    if not os.path.isdir(folder_path):
        raise ValueError("Invalid folder path")
    
    text_files = [f for f in os.listdir(folder_path) if f.endswith(".txt")]
    
    if not text_files:
        print("No text files found.")
        return {}
    
    file_dict = {i + 1: file for i, file in enumerate(text_files)}
    
    for num, name in file_dict.items():
        print(f"{num}. {name}")
    
    return file_dict

def choose_file(file_dict):
    """Allows the user to choose a file by entering a number."""
    try:
        choice = int(input("Enter the number of the file you want to select: "))
        return file_dict.get(choice, None)
    except ValueError:
        print("Invalid input. Please enter a valid number.")
        return None

def read_latex_file(file_path):
    """Reads the content of the selected LaTeX file."""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def get_multiline_input(prompt):
    """Gets multiline input from user for cover letter body."""
    print(prompt)
    lines = []
    print("(Enter your cover letter text. Type 'DONE' on a new line when finished)")
    while True:
        line = input()
        if line.strip().upper() == 'DONE':
            break
        lines.append(line)
    return '\n\n'.join([line for line in lines if line.strip()])

def replace_placeholders(latex_code):
    """
    Searches for placeholders and replaces them with user input.
    Handles multiline input for the cover letter body.
    """
    modified_code = latex_code
    
    for placeholder, prompt in PLACEHOLDERS.items():
        if placeholder in modified_code:
            if placeholder == "PlaceHolderBody":
                user_input = get_multiline_input(prompt)
            else:
                user_input = input(prompt)
            modified_code = modified_code.replace(placeholder, user_input)
    
    return modified_code

def create_pdf_from_latex(latex_code, output_folder, output_filename):
    """
    Generates a PDF from the LaTeX code using pdflatex.
    The LaTeX file is named based on the output PDF filename.
    """
    os.makedirs(output_folder, exist_ok=True)
    
    tex_file_path = os.path.join(output_folder, output_filename.replace(".pdf", ".tex"))
    
    with open(tex_file_path, "w", encoding="utf-8") as f:
        f.write(latex_code)
    
    try:
        subprocess.run(["pdflatex", "-output-directory", output_folder, tex_file_path], check=True)
        print(f"PDF generated successfully: {os.path.join(output_folder, output_filename)}")
        
        # Clean up auxiliary files
        for ext in ['.aux', '.log']:
            aux_file = os.path.join(output_folder, output_filename.replace('.pdf', ext))
            if os.path.exists(aux_file):
                os.remove(aux_file)
                
    except FileNotFoundError:
        print("Error: pdflatex not found. Make sure LaTeX is installed (TeX Live, MiKTeX).")
    except subprocess.CalledProcessError:
        print("Error: Failed to compile LaTeX file.")

# Set folder paths
folder = r"C:\Users\DELL\OneDrive\Desktop\writer2\Tempelates"
output_folder = r"C:\Users\DELL\OneDrive\Desktop\writer2\outputs"

# File selection
print("Select Cover Letter Template:")
file_dict = list_text_files(folder)

if file_dict:
    selected_file = choose_file(file_dict)
    if selected_file:
        file_path = os.path.join(folder, selected_file)
        latex_code = read_latex_file(file_path)
        modified_latex_code = replace_placeholders(latex_code)
        
        # Ask user for the output PDF file name
        output_filename = input("Enter the output PDF file name (without .pdf extension): ").strip()
        if not output_filename:
            output_filename = "cover_letter"  # Default name if the user provides an empty string
        output_filename += ".pdf"  # Ensure the file has a .pdf extension
        
        create_pdf_from_latex(modified_latex_code, output_folder, output_filename)
    else:
        print("Invalid selection.")