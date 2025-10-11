from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from latex_reader import generate_pdf_from_template
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CoverLetterData(BaseModel):
    name: str
    address: str
    city: str
    phone: str
    email: str
    recipient: str
    company: str
    companyAddress: str
    companyCity: str
    position: str
    date: str
    body: str
    template: str

@app.post("/generate-pdf")
def generate_pdf(data: CoverLetterData):
    placeholders = {
        "PlaceHolderName": data.name,
        "PlaceHolderAddress": data.address,
        "PlaceHolderCityStateZip": data.city,
        "PlaceHolderPhone": data.phone,
        "PlaceHolderEmail": data.email,
        "PlaceHolderHiringManagerName": data.recipient,
        "PlaceHolderCompanyName": data.company,
        "PlaceHolderCompanyAddress": data.companyAddress,
        "PlaceHolderCompanyCityStateZip": data.companyCity,
        "PlaceHolderPositionTitle": data.position,
        "PlaceHolderDate": data.date,
        "PlaceHolderBody": data.body,
    }

    output_pdf = generate_pdf_from_template(data.template, placeholders)

    with open(output_pdf, "rb") as f:
        pdf_data = f.read()

    return Response(content=pdf_data, media_type="application/pdf")
