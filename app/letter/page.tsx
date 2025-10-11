"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface BasicInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  outputFilename: string;
}

interface CompanyInfo {
  recipient: string;
  company: string;
  companyAddress: string;
  companyCity: string;
  position: string;
}

interface Templates {
  [key: number]: string;
}

const TemplateForm: React.FC = () => {
  const [templates, setTemplates] = useState<Templates>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    outputFilename: ''
  });
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    recipient: '',
    company: '',
    companyAddress: '',
    companyCity: '',
    position: ''
  });
  const [letterDate, setLetterDate] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        setStatus('Error loading templates');
      }
    };
    fetchTemplates();
  }, []);

  const handleBasicInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          basicInfo,
          companyInfo,
          letterDate,
          letterBody
        })
      });
      const data = await response.json();
      if (data.success) setStatus('CV generated successfully!');
      else setStatus('Failed to generate CV.');
    } catch (error) {
      setStatus('Error generating CV');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cover Letter Generator</h1>
      <form onSubmit={handleGenerate} className="space-y-4">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        {Object.keys(basicInfo).map(key => (
          <input
            key={key}
            type="text"
            name={key}
            value={(basicInfo as any)[key]}
            onChange={handleBasicInfoChange}
            placeholder={key}
            className="w-full p-2 border rounded"
          />
        ))}

        <h2 className="text-xl font-semibold mt-4">Company Information</h2>
        {Object.keys(companyInfo).map(key => (
          <input
            key={key}
            type="text"
            name={key}
            value={(companyInfo as any)[key]}
            onChange={handleCompanyInfoChange}
            placeholder={key}
            className="w-full p-2 border rounded"
          />
        ))}

        <div>
          <label className="block font-semibold">Date</label>
          <input
            type="text"
            value={letterDate}
            onChange={e => setLetterDate(e.target.value)}
            placeholder="e.g. October 11, 2025"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Letter Body</label>
          <textarea
            value={letterBody}
            onChange={e => setLetterBody(e.target.value)}
            placeholder="Write your cover letter here..."
            className="w-full p-2 border rounded h-40"
          />
        </div>

        <div>
          <label className="block font-semibold">Select Template</label>
          <select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a template</option>
            {Object.entries(templates).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Generate CV</button>
        {status && <p className="mt-2 text-gray-700">{status}</p>}
      </form>
    </div>
  );
};

export default TemplateForm;