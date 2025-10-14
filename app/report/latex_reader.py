import os
import subprocess

# Folder paths (update if needed)
TEMPLATE_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\Tempelates"
OUTPUT_FOLDER = r"C:\Users\DELL\OneDrive\Desktop\writer2\outputs"

# Placeholders expected inside the LaTeX template
PLACEHOLDERS = {
    "PlaceHolderTitle": "Enter report title: ",
    "PlaceHolderAuthor": "Enter author details: ",
    "PlaceHolderInstitution": "Enter institution name: ",
    "PlaceHolderDate": "Enter date (e.g., October 14, 2025): ",
    "PlaceHolderAbstract": "Enter abstract (type DONE when finished):\n",
    "PlaceHolderBody": "Enter report body (type DONE when finished):\n"
}


def list_text_files(folder_path):
    """List all .txt LaTeX templates in the folder."""
    if not os.path.isdir(folder_path):
        print(f"❌ Error: '{folder_path}' is not a valid folder.")
        return {}

    text_files = [f for f in os.listdir(folder_path) if f.endswith(".txt")]

    if not text_files:
        print(f"⚠️ No .txt templates found in '{folder_path}'")
        return {}

    print("\nAvailable Templates:")
    file_dict = {i + 1: file for i, file in enumerate(text_files)}
    for i, name in file_dict.items():
        print(f" {i}. {name}")

    return file_dict


def choose_file(file_dict):
    """Prompt the user to choose one of the listed templates."""
    try:
        choice = int(input("\nEnter the number of the template you want to use: "))
        return file_dict.get(choice)
    except (ValueError, KeyError):
        print("⚠️ Invalid selection.")
        return None


def read_latex_template(file_path):
    """Read LaTeX code stored in a .txt file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error reading template: {e}")
        return None


def get_multiline_input(prompt):
    """Capture multiline text input until 'DONE'."""
    print(prompt)
    lines = []
    print("(Type 'DONE' on a new line when finished)\n")
    while True:
        line = input()
        if line.strip().upper() == "DONE":
            break
        lines.append(line)
    return "\n".join(lines)


def get_authors():
    """Capture multiple author details interactively."""
    authors = []
    print("Enter author details (up to 6 authors).")
    for i in range(6):
        print(f"\nAuthor {i+1} (leave name blank to stop):")
        name = input("  Name: ").strip()
        if not name:
            break
        department = input("  Department: ").strip()
        organization = input("  Organization: ").strip()
        city = input("  City: ").strip()
        country = input("  Country: ").strip()
        email = input("  Email: ").strip()
        authors.append({
            "name": name,
            "department": department,
            "organization": organization,
            "city": city,
            "country": country,
            "email": email
        })
    return authors


def generate_authors_latex(authors):
    """
    Generate LaTeX authors block for IEEEtran conference template.
    Each author gets ordinal superscript and is separated by \and.
    """
    if not authors:
        return ""

    ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th"]
    author_blocks = []

    for idx, author in enumerate(authors):
        ordinal = ordinals[idx]
        block = (
            r"\IEEEauthorblockN{" + str(idx+1) + r"\textsuperscript{" + ordinal + "} " + author["name"] + "}\n"
            r"\IEEEauthorblockA{\textit{" + author["department"] + r"} \\" + "\n"
            r"\textit{" + author["organization"] + r"}\\" + "\n"
            + author["city"] + ", " + author["country"] + r" \\" + "\n"
            + author["email"] + "}"
        )
        author_blocks.append(block)

    # Join all blocks with \and
    author_section = r"\author{" + "\n\\and\n".join(author_blocks) + "\n}"
    return author_section


def replace_placeholders(latex_code):
    """Replace placeholders with user input interactively."""
    for placeholder, message in PLACEHOLDERS.items():
        if placeholder in latex_code:
            if placeholder == "PlaceHolderAuthor":
                authors_list = get_authors()
                user_input = generate_authors_latex(authors_list)
            elif "Body" in placeholder or "Abstract" in placeholder:
                user_input = get_multiline_input(message)
            else:
                user_input = input(message)
            latex_code = latex_code.replace(placeholder, user_input)
    return latex_code


def create_pdf_from_latex(latex_code, output_folder, output_filename):
    """Write .tex and generate PDF using pdflatex."""
    os.makedirs(output_folder, exist_ok=True)
    tex_path = os.path.join(output_folder, output_filename.replace(".pdf", ".tex"))

    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(latex_code)

    try:
        subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-output-directory", output_folder, tex_path],
            check=True
        )
        print(f"✅ PDF generated successfully: {os.path.join(output_folder, output_filename)}")
    except FileNotFoundError:
        print("❌ Error: pdflatex not installed. Please install TeX Live or MiKTeX.")
    except subprocess.CalledProcessError:
        print("❌ Error compiling LaTeX — check for syntax issues.")


def main():
    print("=== LaTeX Report Generator ===")
    file_dict = list_text_files(TEMPLATE_FOLDER)

    if not file_dict:
        print("No templates found. Exiting.")
        return

    selected = choose_file(file_dict)
    if not selected:
        print("No valid file selected. Exiting.")
        return

    file_path = os.path.join(TEMPLATE_FOLDER, selected)
    latex_code = read_latex_template(file_path)
    if not latex_code:
        print("Error loading template. Exiting.")
        return

    filled_code = replace_placeholders(latex_code)
    output_filename = input("\nEnter output PDF filename (without extension): ").strip() or "report"
    output_filename += ".pdf"

    create_pdf_from_latex(filled_code, OUTPUT_FOLDER, output_filename)


if __name__ == "__main__":
    main()
