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
  score: string;
  isPresent: boolean;
  scoreType: 'cgpa' | 'percentage';
}

interface ExperienceItem {
  description: string;
}

interface ExperienceEntry {
  position: string;
  company: string;
  location: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  items: ExperienceItem[];
}

interface ProjectItem {
  description: string;
}

interface ProjectEntry {
  title: string;
  tools: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  items: ExperienceItem[];
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
    score: '',
    isPresent: false,
    scoreType: 'percentage'
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

  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([{
    position: '',
    company: '',
    location: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isPresent: false,
    items: [{ description: '' }]
  }]);

  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([{
    title: '',
    tools: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isPresent: false,
    items: [{ description: '' }]
  }]);

  const formatScore = (entry: EducationEntry) => {
    // Remove any special LaTeX characters from the score
    const sanitizedScore = entry.score.replace(/[\\{}]/g, '');
    
    if (entry.scoreType === 'cgpa') {
      return `CGPA: ${sanitizedScore}`;
    } else {
      // Ensure the percentage has the % symbol
      const scoreWithSymbol = sanitizedScore.includes('%') 
        ? sanitizedScore 
        : `${sanitizedScore}\\%`;
      return `Percentage: ${scoreWithSymbol}`;
    }
  };

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
        ...(field === 'isPresent' && value === true ? { endMonth: 'Present', endYear: 'Present' } : {})
      };
      return newEntries;
    });
  };

  const toggleScoreType = (index: number) => {
    setEducationEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        scoreType: newEntries[index].scoreType === 'cgpa' ? 'percentage' : 'cgpa'
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
      score: '',
      isPresent: false,
      scoreType: 'percentage'
    }]);
  };

  const removeEducationEntry = (index: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleExperienceChange = (index: number, field: keyof Omit<ExperienceEntry, 'items'>, value: string | boolean) => {
    setExperienceEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
        ...(field === 'isPresent' && value === true ? { endMonth: 'Present', endYear: 'Present' } : {})
      };
      return newEntries;
    });
  };
  
  const handleExperienceItemChange = (expIndex: number, itemIndex: number, value: string) => {
    setExperienceEntries(prev => {
      const newEntries = [...prev];
      newEntries[expIndex].items[itemIndex] = { description: value };
      return newEntries;
    });
  };
  
  const addExperienceEntry = () => {
    setExperienceEntries(prev => [...prev, {
      position: '',
      company: '',
      location: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isPresent: false,
      items: [{ description: '' }]
    }]);
  };
  
  const removeExperienceEntry = (index: number) => {
    if (experienceEntries.length > 1) {
      setExperienceEntries(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const addExperienceItem = (expIndex: number) => {
    setExperienceEntries(prev => {
      const newEntries = [...prev];
      newEntries[expIndex].items.push({ description: '' });
      return newEntries;
    });
  };
  
  const removeExperienceItem = (expIndex: number, itemIndex: number) => {
    if (experienceEntries[expIndex].items.length > 1) {
      setExperienceEntries(prev => {
        const newEntries = [...prev];
        newEntries[expIndex].items = newEntries[expIndex].items.filter((_, i) => i !== itemIndex);
        return newEntries;
      });
    }
  };










  
  const handleProjectChange = (index: number, field: keyof Omit<ProjectEntry, 'items'>, value: string | boolean) => {
    setProjectEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
        ...(field === 'isPresent' && value === true ? { endMonth: 'Present', endYear: 'Present' } : {})
      };
      return newEntries;
    });
  };
  
  const handleProjectItemChange = (proIndex: number, itemIndex: number, value: string) => {
    setProjectEntries(prev => {
      const newEntries = [...prev];
      newEntries[proIndex].items[itemIndex] = { description: value };
      return newEntries;
    });
  };
  
  const addProjectEntry = () => {
    setProjectEntries(prev => [...prev, {
      title: '',
      tools: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isPresent: false,
      items: [{ description: '' }]
    }]);
  };
  
  const removeProjectEntry = (index: number) => {
    if (projectEntries.length > 1) {
      setProjectEntries(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const addProjectItem = (proIndex: number) => {
    setProjectEntries(prev => {
      const newEntries = [...prev];
      newEntries[proIndex].items.push({ description: '' });
      return newEntries;
    });
  };
  
  const removeProjectItem = (proIndex: number, itemIndex: number) => {
    if (projectEntries[proIndex].items.length > 1) {
      setProjectEntries(prev => {
        const newEntries = [...prev];
        newEntries[proIndex].items = newEntries[proIndex].items.filter((_, i) => i !== itemIndex);
        return newEntries;
      });
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

    const transformedEducationEntries = educationEntries.map(entry => ({
      ...entry,
      score: formatScore(entry)
    }));
  
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: selectedTemplate,
          basic_info: basicInfoPayload,
          education_entries: transformedEducationEntries,
          experience_entries: experienceEntries,
          project_entries:projectEntries,
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
        {[
          ['education', 'Educational Institute'],
          ['course', 'Course'],
          ['location', 'Institute Location'],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">
              {label}:
              <input
                type="text"
                value={String(entry[field as keyof EducationEntry])}
                onChange={(e) => handleEducationChange(index, field as keyof EducationEntry, e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </label>
          </div>
        ))}

        {/* Score input with toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">
              {entry.scoreType === 'cgpa' ? 'CGPA' : 'Percentage'}:
            </label>
            <button
              type="button"
              onClick={() => toggleScoreType(index)}
              className="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
            >
              Switch to {entry.scoreType === 'cgpa' ? 'Percentage' : 'CGPA'}
            </button>
          </div>
          <input
            type="text"
            value={entry.score}
            onChange={(e) => handleEducationChange(index, 'score', e.target.value)}
            className="block w-full p-2 border rounded-md"
            placeholder={`Enter ${entry.scoreType === 'cgpa' ? 'CGPA' : 'Percentage'}`}
            required
          />
        </div>

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
{/* Experience Section */}
<div className="bg-gray-50 p-4 rounded-lg space-y-4">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Experience Details</h2>
    <button
      type="button"
      onClick={addExperienceEntry}
      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
    >
      Add Experience
    </button>
  </div>

  {experienceEntries.map((entry, expIndex) => (
    <div key={expIndex} className="bg-white p-4 rounded-lg space-y-4 relative">
      {experienceEntries.length > 1 && (
        <button
          type="button"
          onClick={() => removeExperienceEntry(expIndex)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      )}
      
      <h3 className="text-lg font-semibold mb-2">Experience Entry {expIndex + 1}</h3>
      
      <div className="space-y-4">
        {/* Basic Experience Fields */}
        {[
          ['position', 'Position Title'],
          ['company', 'Company Name'],
          ['location', 'Location']
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">
              {label}:
              <input
                type="text"
                value={String(entry[field as keyof Omit<ExperienceEntry, 'items'>])}
                onChange={(e) => handleExperienceChange(expIndex, field as keyof Omit<ExperienceEntry, 'items'>, e.target.value)}
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
                onChange={(e) => handleExperienceChange(expIndex, 'startMonth', e.target.value)}
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
                onChange={(e) => handleExperienceChange(expIndex, 'startYear', e.target.value)}
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
                onChange={(e) => handleExperienceChange(expIndex, 'isPresent', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span>Currently Working Here</span>
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
                    onChange={(e) => handleExperienceChange(expIndex, 'endMonth', e.target.value)}
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
                    onChange={(e) => handleExperienceChange(expIndex, 'endYear', e.target.value)}
                    className="mt-1 block w-full p-2 border rounded-md"
                    required
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Experience Items/Bullet Points */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Description Points</h4>
            <button
              type="button"
              onClick={() => addExperienceItem(expIndex)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Point
            </button>
          </div>
          
          {entry.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex gap-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleExperienceItemChange(expIndex, itemIndex, e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Enter description point"
                required
              />
              {entry.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperienceItem(expIndex, itemIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  ))}
</div>

{/* Project Section */}
<div className="bg-gray-50 p-4 rounded-lg space-y-4">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Project Details</h2>
    <button
      type="button"
      onClick={addProjectEntry}
      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
    >
      Add Project
    </button>
  </div>

  {projectEntries.map((entry, proIndex) => (
    <div key={proIndex} className="bg-white p-4 rounded-lg space-y-4 relative">
      {projectEntries.length > 1 && (
        <button
          type="button"
          onClick={() => removeProjectEntry(proIndex)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      )}
      
      <h3 className="text-lg font-semibold mb-2">Project Entry {proIndex + 1}</h3>
      
      <div className="space-y-4">
        {/* Basic Project Fields */}
        {[
          ['title', 'Project Title'],
          ['tools', 'Project Tools']
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">
              {label}:
              <input
                type="text"
                value={String(entry[field as keyof Omit<ProjectEntry, 'items'>])}
                onChange={(e) => handleProjectChange(proIndex, field as keyof Omit<ProjectEntry, 'items'>, e.target.value)}
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
                onChange={(e) => handleProjectChange(proIndex, 'startMonth', e.target.value)}
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
                onChange={(e) => handleProjectChange(proIndex, 'startYear', e.target.value)}
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
                onChange={(e) => handleProjectChange(proIndex, 'isPresent', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span>Currently Working on this project</span>
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
                    onChange={(e) => handleProjectChange(proIndex, 'endMonth', e.target.value)}
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
                    onChange={(e) => handleProjectChange(proIndex, 'endYear', e.target.value)}
                    className="mt-1 block w-full p-2 border rounded-md"
                    required
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Experience Items/Bullet Points */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Description Points</h4>
            <button
              type="button"
              onClick={() => addProjectItem(proIndex)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Point
            </button>
          </div>
          
          {entry.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex gap-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleProjectItemChange(proIndex, itemIndex, e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Enter description point"
                required
              />
              {entry.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProjectItem(proIndex, itemIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
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