"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface PersonalInfo {
  name: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
}

interface CompanyInfo {
  hiringManagerName: string;
  companyName: string;
  companyAddress: string;
  companyCityStateZip: string;
  positionTitle: string;
}

interface LetterDetails {
  date: string;
  body: string;
  outputFilename: string;
}

interface Templates {
  [key: number]: string;
}

const CoverLetterForm: React.FC = () => {
  const [templates, setTemplates] = useState<Templates>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [status, setStatus] = useState('');

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    address: '',
    cityStateZip: '',
    phone: '',
    email: ''
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    hiringManagerName: '',
    companyName: '',
    companyAddress: '',
    companyCityStateZip: '',
    positionTitle: ''
  });

  const [letterDetails, setLetterDetails] = useState<LetterDetails>({
    date: '',
    body: '',
    outputFilename: ''
  });

  // Set the date after component mounts to avoid hydration mismatch
  useEffect(() => {
    setLetterDetails(prev => ({
      ...prev,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }));
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        setStatus('Error loading templates');
      }
    };
    fetchTemplates();
  }, []);

  const handlePersonalInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLetterDetailsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLetterDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Generating Cover Letter PDF...');

    const payload = {
      PlaceHolderName: personalInfo.name,
      PlaceHolderAddress: personalInfo.address,
      PlaceHolderCityStateZip: personalInfo.cityStateZip,
      PlaceHolderPhone: personalInfo.phone,
      PlaceHolderEmail: personalInfo.email,
      PlaceHolderHiringManagerName: companyInfo.hiringManagerName,
      PlaceHolderCompanyName: companyInfo.companyName,
      PlaceHolderCompanyAddress: companyInfo.companyAddress,
      PlaceHolderCompanyCityStateZip: companyInfo.companyCityStateZip,
      PlaceHolderPositionTitle: companyInfo.positionTitle,
      PlaceHolderDate: letterDetails.date,
      PlaceHolderBody: letterDetails.body
    };

    try {
      const response = await fetch('http://127.0.0.1:8001/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: selectedTemplate,
          cover_letter_data: payload,
          output_filename: letterDetails.outputFilename,
        }),
      });

      const data = await response.json();
      setStatus(response.ok ? 'Cover Letter PDF generated successfully!' : `Error: ${data.detail}`);
    } catch (error) {
      setStatus('Error generating Cover Letter PDF');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cover Letter Generator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Template:
            <select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            >
              <option value="">Choose a template</option>
              {Object.entries(templates).map(([id, name]) => (
                <option key={id} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name:
              <input
                type="text"
                name="name"
                value={personalInfo.name}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Street Address:
              <input
                type="text"
                name="address"
                value={personalInfo.address}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="123 Main Street"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              City, State, ZIP:
              <input
                type="text"
                name="cityStateZip"
                value={personalInfo.cityStateZip}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="New York, NY 10001"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number:
              <input
                type="tel"
                name="phone"
                value={personalInfo.phone}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="+1-234-567-8900"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address:
              <input
                type="email"
                name="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </label>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Company & Position Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Hiring Manager Name:
              <input
                type="text"
                name="hiringManagerName"
                value={companyInfo.hiringManagerName}
                onChange={handleCompanyInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="Ms. Jane Smith"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name:
              <input
                type="text"
                name="companyName"
                value={companyInfo.companyName}
                onChange={handleCompanyInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company Address:
              <input
                type="text"
                name="companyAddress"
                value={companyInfo.companyAddress}
                onChange={handleCompanyInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="456 Corporate Blvd"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Company City, State, ZIP:
              <input
                type="text"
                name="companyCityStateZip"
                value={companyInfo.companyCityStateZip}
                onChange={handleCompanyInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="San Francisco, CA 94105"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Position Title:
              <input
                type="text"
                name="positionTitle"
                value={companyInfo.positionTitle}
                onChange={handleCompanyInfoChange}
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="Software Engineer"
                required
              />
            </label>
          </div>
        </div>

        {/* Letter Content */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Letter Content</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Date:
              <input
                type="text"
                name="date"
                value={letterDetails.date}
                onChange={handleLetterDetailsChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Letter Body:
              <textarea
                name="body"
                value={letterDetails.body}
                onChange={handleLetterDetailsChange}
                className="mt-1 block w-full p-2 border rounded-md"
                rows={12}
                placeholder="I am writing to express my strong interest in the [Position Title] at [Company Name]...&#10;&#10;[Add multiple paragraphs explaining your qualifications, experience, and interest]&#10;&#10;Thank you for your consideration..."
                required
              />
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Tip: Write 3-4 paragraphs explaining why you're interested in the position, your relevant qualifications, and what you can bring to the company.
            </p>
          </div>
        </div>

        {/* Output Filename */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Output Filename:
            <input
              type="text"
              name="outputFilename"
              value={letterDetails.outputFilename}
              onChange={handleLetterDetailsChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
              placeholder="cover-letter-company-name"
            />
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
          disabled={!selectedTemplate || !letterDetails.outputFilename}
        >
          Generate Cover Letter PDF
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded-md ${
            status.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-400' 
              : 'bg-green-100 text-green-700 border border-green-400'
          }`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
};

export default CoverLetterForm;