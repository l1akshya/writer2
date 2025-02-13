"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface EducationEntry {
  education: string;
  course: string;
  location: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
}

interface BasicInfo {
  name: string;
  contact: string;
  email: string;
  linkedin: string;
  github: string;
  outputFilename: string;
}

interface Templates {
  [key: number]: string;
}

const TemplateForm: React.FC = () => {
  const [templates, setTemplates] = useState<Templates>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([{
    education: '',
    course: '',
    location: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isPresent: false
  }]);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    contact: '',
    email: '',
    linkedin: '',
    github: '',
    outputFilename: ''
  });
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
    setBasicInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (index: number, field: keyof EducationEntry, value: string | boolean) => {
    setEducationEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
        // Reset end dates when toggling to present
        ...(field === 'isPresent' && value === true ? { endMonth: 'Present', endYear: 'Present' } : {})
      };
      return newEntries;
    });
  };

  const addEducationEntry = () => {
    setEducationEntries(prev => [...prev, {
      education: '',
      course: '',
      location: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isPresent: false
    }]);
  };

  const removeEducationEntry = (index: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Generating PDF...');

    const basicInfoPayload = {
      'Place_Holder_Name': basicInfo.name,
      'Place_Holder_contact': basicInfo.contact,
      'Place_Holder_Mail': basicInfo.email,
      'Place_Holder_linkedin': basicInfo.linkedin,
      'Place_Holder_github': basicInfo.github,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: selectedTemplate,
          basic_info: basicInfoPayload,
          education_entries: educationEntries,
          output_filename: basicInfo.outputFilename,
        }),
      });

      const data = await response.json();
      setStatus(response.ok ? 'PDF generated successfully!' : `Error: ${data.detail}`);
    } catch (error) {
      setStatus('Error generating PDF');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Resume Generator</h1>
      
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

        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          
          {Object.entries({
            name: 'Full Name',
            contact: 'Contact Number',
            email: 'Email Address',
            linkedin: 'LinkedIn Profile',
            github: 'GitHub Profile'
          }).map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2">
                {label}:
                <input
                  type={field === 'email' ? 'email' : field.includes('url') ? 'url' : 'text'}
                  name={field}
                  value={basicInfo[field as keyof BasicInfo]}
                  onChange={handleBasicInfoChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </label>
            </div>
          ))}
        </div>

        {/* Education Entries */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education Details</h2>
            <button
              type="button"
              onClick={addEducationEntry}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Add Education
            </button>
          </div>

          {educationEntries.map((entry, index) => (
            <div key={index} className="bg-white p-4 rounded-lg space-y-4 relative">
              {educationEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducationEntry(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
              
              <h3 className="text-lg font-semibold mb-2">Education Entry {index + 1}</h3>
              
              <div className="space-y-4">
                {/* Education Entry Fields */}
                {[
                  ['education', 'Educational Institute'],
                  ['course', 'Course'],
                  ['location', 'Institute Location']
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2">
                      {label}:
                      <input
                        type="text"
                        value={entry[field as keyof EducationEntry]}
                        onChange={(e) => handleEducationChange(index, field as keyof EducationEntry, e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                      />
                    </label>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date Fields */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Month:
                      <input
                        type="text"
                        value={entry.startMonth}
                        onChange={(e) => handleEducationChange(index, 'startMonth', e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Year:
                      <input
                        type="text"
                        value={entry.startYear}
                        onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                      />
                    </label>
                  </div>

                  {/* Present Toggle */}
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={entry.isPresent}
                        onChange={(e) => handleEducationChange(index, 'isPresent', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-500"
                      />
                      <span>Currently Studying Here</span>
                    </label>
                  </div>

                  {/* End Date Fields - Only show if not present */}
                  {!entry.isPresent && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          End Month:
                          <input
                            type="text"
                            value={entry.endMonth}
                            onChange={(e) => handleEducationChange(index, 'endMonth', e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            required
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          End Year:
                          <input
                            type="text"
                            value={entry.endYear}
                            onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            required
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Output Filename */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Output Filename:
            <input
              type="text"
              name="outputFilename"
              value={basicInfo.outputFilename}
              onChange={handleBasicInfoChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
              placeholder="my-resume"
            />
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
          disabled={!selectedTemplate || !basicInfo.outputFilename}
        >
          Generate Resume PDF
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

export default TemplateForm;