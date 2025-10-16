"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface AuthorInfo {
  name: string;
  department: string;
  organization: string;
  city: string;
  country: string;
  email: string;
}

interface Templates {
  [key: number]: string;
}

const ReportTemplateForm: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [templates, setTemplates] = useState<Templates>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [abstract, setAbstract] = useState<string>('');
  const [indexTerms, setIndexTerms] = useState<string[]>(['']);
  const [introduction, setIntroduction] = useState<string>('');
  const [outputFilename, setOutputFilename] = useState<string>('');
  const [authors, setAuthors] = useState<AuthorInfo[]>([{
    name: '',
    department: '',
    organization: '',
    city: '',
    country: '',
    email: ''
  }]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8002/report-templates');
        const data: Templates = await response.json();
        setTemplates(data);
      } catch (error) {
        setStatus('Error loading templates');
      }
    };
    fetchTemplates();
  }, []);

  const handleAuthorChange = (index: number, field: keyof AuthorInfo, value: string): void => {
    setAuthors(prev => {
      const newAuthors = [...prev];
      newAuthors[index] = { ...newAuthors[index], [field]: value };
      return newAuthors;
    });
  };

  const addAuthor = (): void => {
    if (authors.length < 6) {
      setAuthors(prev => [...prev, {
        name: '',
        department: '',
        organization: '',
        city: '',
        country: '',
        email: ''
      }]);
    } else {
      setStatus('Maximum 6 authors allowed');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const removeAuthor = (index: number): void => {
    if (authors.length > 1) {
      setAuthors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleIndexTermChange = (index: number, value: string): void => {
    setIndexTerms(prev => {
      const newTerms = [...prev];
      newTerms[index] = value;
      return newTerms;
    });
  };

  const addIndexTerm = (): void => {
    setIndexTerms(prev => [...prev, '']);
  };

  const removeIndexTerm = (index: number): void => {
    if (indexTerms.length > 1) {
      setIndexTerms(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setStatus('Generating Report PDF...');

    try {
      const indexTermsStr = indexTerms.filter(term => term.trim()).join(', ');

      const response = await fetch('http://127.0.0.1:8002/generate-report-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_name: selectedTemplate,
          title,
          abstract,
          index_terms: indexTermsStr,
          introduction,
          authors,
          output_filename: outputFilename,
        }),
      });

      const data = await response.json();
      setStatus(response.ok ? 'Report PDF generated successfully!' : `Error: ${data.detail}`);
    } catch (error) {
      setStatus('Error generating PDF');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">IEEE Report Generator</h1>
          <p className="text-gray-600">Create professional IEEE conference papers with ease</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Template: *
              <select
                value={selectedTemplate}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedTemplate(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a template</option>
                {Object.entries(templates).map(([id, name]: [string, string]) => (
                  <option key={id} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Report Title */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Report Information</h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Report Title: *
                <input
                  type="text"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your report title"
                  required
                />
              </label>
            </div>
          </div>

          {/* Author Information (moved above Abstract and Introduction) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Author Information</h2>
              <button
                type="button"
                onClick={addAuthor}
                disabled={authors.length >= 6}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
                  authors.length >= 6
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                }`}
              >
                Add Author ({authors.length}/6)
              </button>
            </div>

            {authors.map((author: AuthorInfo, index: number) => (
              <div key={index} className="bg-white p-5 rounded-lg space-y-4 relative border-2 border-gray-300 shadow-sm">
                {authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-semibold text-sm bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                  >
                    ✕ Remove
                  </button>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Author {index + 1} {index === 0 && <span className="text-blue-600 text-sm">(Primary)</span>}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Full Name: *
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAuthorChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., John Doe"
                        required
                        suppressHydrationWarning
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Department: *
                      <input
                        type="text"
                        value={author.department}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAuthorChange(index, 'department', e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Computer Science"
                        required
                        suppressHydrationWarning
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Organization: *
                      <input
                        type="text"
                        value={author.organization}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAuthorChange(index, 'organization', e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Stanford University"
                        required
                        suppressHydrationWarning
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      City: *
                      <input
                        type="text"
                        value={author.city}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAuthorChange(index, 'city', e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., New York"
                        required
                        suppressHydrationWarning
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Country: *
                      <input
                        type="text"
                        value={author.country}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAuthorChange(index, 'country', e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., USA"
                        required
                        suppressHydrationWarning
                      />
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Email Address: *
                      <input
                        type="email"
                        value={author.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAuthorChange(index, 'email', e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., john.doe@university.edu"
                        required
                        suppressHydrationWarning
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Abstract */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Abstract: *
              <textarea
                value={abstract}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAbstract(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your abstract"
                rows={4}
                required
              />
            </label>
          </div>

          {/* Index Terms */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Index Terms</h2>
              <button
                type="button"
                onClick={addIndexTerm}
                className="px-3 py-2 rounded-md text-sm bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg transition-colors font-medium"
              >
                + Add Term
              </button>
            </div>
            {indexTerms.map((term, index) => (
              <div key={index} className="flex gap-2 items-end">
                <input
                  type="text"
                  value={term}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleIndexTermChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Index term ${index + 1}`}
                />
                {indexTerms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIndexTerm(index)}
                    className="px-3 py-2 text-sm text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">Terms will be separated by commas in the report</p>
          </div>

          {/* Introduction */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Introduction: *
              <textarea
                value={introduction}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setIntroduction(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your introduction"
                rows={4}
                required
              />
            </label>
          </div>

          {/* Output Filename */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Output Filename: *
              <input
                type="text"
                value={outputFilename}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOutputFilename(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., my-ieee-report"
                suppressHydrationWarning
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Don't include .pdf extension - it will be added automatically
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedTemplate || !title || !abstract || !introduction || !outputFilename}
          >
            Generate Report PDF
          </button>

          {/* Status Message */}
          {status && (
            <div className={`mt-4 p-4 rounded-md border-l-4 ${
              status.includes('Error')
                ? 'bg-red-50 text-red-700 border-red-500'
                : status.includes('successfully')
                ? 'bg-green-50 text-green-700 border-green-500'
                : 'bg-blue-50 text-blue-700 border-blue-500'
            }`}>
              <div className="flex items-center gap-2">
                {status.includes('Error') && <span className="text-xl">!</span>}
                {status.includes('successfully') && <span className="text-xl">✓</span>}
                {status.includes('Generating') && <span className="text-xl">...</span>}
                <span className="font-medium">{status}</span>
              </div>
            </div>
          )}
        </form>

        {/* Quick Guide */}
        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-3 text-lg">Quick Guide</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-2">
            <li><strong>Step 1:</strong> Select an IEEE report template</li>
            <li><strong>Step 2:</strong> Enter your report title</li>
            <li><strong>Step 3:</strong> Add author information (up to 6)</li>
            <li><strong>Step 4:</strong> Write your abstract</li>
            <li><strong>Step 5:</strong> Add index terms</li>
            <li><strong>Step 6:</strong> Write your introduction</li>
            <li><strong>Step 7:</strong> Provide output filename and click "Generate"</li>
          </ul>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> All fields marked with * are required. The report will be generated in IEEE conference format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplateForm;
