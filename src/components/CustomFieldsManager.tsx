import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Eye, Settings, FileText, User, Package, Calendar } from 'lucide-react';
import type { CustomFieldDefinition, FieldValidation } from '../types';

export const CustomFieldsManager: React.FC = () => {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([
    {
      id: '1',
      name: 'purchase_order',
      label: 'Purchase Order Number',
      type: 'text',
      required: false,
      appliesTo: 'invoice',
      category: 'Billing',
      order: 1
    },
    {
      id: '2',
      name: 'project_code',
      label: 'Project Code',
      type: 'text',
      required: true,
      appliesTo: 'invoice',
      category: 'Project',
      order: 2
    }
  ]);

  const [selectedField, setSelectedField] = useState<CustomFieldDefinition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'number', label: 'Number', icon: Settings },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'dropdown', label: 'Dropdown', icon: Settings },
    { value: 'checkbox', label: 'Checkbox', icon: Settings },
    { value: 'textarea', label: 'Textarea', icon: FileText },
    { value: 'file', label: 'File Upload', icon: Package }
  ];

  const applyToOptions = [
    { value: 'invoice', label: 'Invoices', icon: FileText },
    { value: 'client', label: 'Clients', icon: User },
    { value: 'item', label: 'Line Items', icon: Package },
    { value: 'all', label: 'All', icon: Settings }
  ];

  const categories = ['all', 'Billing', 'Project', 'Client', 'Shipping', 'Payment', 'Tax', 'Other'];

  const createNewField = () => {
    const newField: CustomFieldDefinition = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      appliesTo: 'invoice',
      category: 'Other',
      order: customFields.length + 1
    };
    setSelectedField(newField);
    setIsEditing(true);
  };

  const saveField = () => {
    if (!selectedField) return;
    
    if (customFields.find(f => f.id === selectedField.id)) {
      setCustomFields(prev => prev.map(f => f.id === selectedField.id ? selectedField : f));
    } else {
      setCustomFields(prev => [...prev, selectedField]);
    }
    
    setIsEditing(false);
    setSelectedField(null);
  };

  const deleteField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      setIsEditing(false);
    }
  };

  const updateField = (field: keyof CustomFieldDefinition, value: any) => {
    if (!selectedField) return;
    setSelectedField(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateValidation = (field: keyof FieldValidation, value: any) => {
    if (!selectedField) return;
    setSelectedField(prev => prev ? {
      ...prev,
      validation: { ...prev.validation, [field]: value }
    } : null);
  };

  const addOption = () => {
    if (!selectedField || selectedField.type !== 'dropdown') return;
    const newOptions = [...(selectedField.options || []), ''];
    updateField('options', newOptions);
  };

  const updateOption = (index: number, value: string) => {
    if (!selectedField || !selectedField.options) return;
    const newOptions = [...selectedField.options];
    newOptions[index] = value;
    updateField('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (!selectedField || !selectedField.options) return;
    const newOptions = selectedField.options.filter((_, i) => i !== index);
    updateField('options', newOptions);
  };

  const filteredFields = activeCategory === 'all' 
    ? customFields 
    : customFields.filter(f => f.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Custom Fields</h1>
          <p className="text-gray-600 mt-1">Add custom fields to invoices, clients, and line items</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={createNewField}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Field
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fields List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Custom Fields ({filteredFields.length})
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {filteredFields.map(field => (
                <div
                  key={field.id}
                  onClick={() => {
                    setSelectedField(field);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedField?.id === field.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{field.label}</div>
                      <div className="text-xs text-gray-500">
                        {field.type} • {field.appliesTo} • {field.category}
                      </div>
                      {field.required && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedField(field);
                          setIsEditing(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No custom fields found</p>
                  <p className="text-sm">Create your first custom field to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Field Editor */}
        <div className="lg:col-span-2">
          {selectedField ? (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {isEditing ? 'Edit Field' : 'Field Details'}
                  </h3>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                        <button
                          onClick={saveField}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                    <input
                      type="text"
                      value={selectedField.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="field_name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Label</label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => updateField('label', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Field Label"
                    />
                  </div>
                </div>

                {/* Field Type and Applies To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                    <select
                      value={selectedField.type}
                      onChange={(e) => updateField('type', e.target.value as any)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applies To</label>
                    <select
                      value={selectedField.appliesTo}
                      onChange={(e) => updateField('appliesTo', e.target.value as any)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      {applyToOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category and Required */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedField.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      {categories.filter(c => c !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedField.required}
                      onChange={(e) => updateField('required', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                      Required field
                    </label>
                  </div>
                </div>

                {/* Dropdown Options */}
                {selectedField.type === 'dropdown' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dropdown Options</label>
                    <div className="space-y-2">
                      {(selectedField.options || []).map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            disabled={!isEditing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          {isEditing && (
                            <button
                              onClick={() => removeOption(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          onClick={addOption}
                          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Validation Rules */}
                {isEditing && (selectedField.type === 'text' || selectedField.type === 'number') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Validation Rules</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedField.type === 'text' && (
                        <>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Length</label>
                            <input
                              type="number"
                              value={selectedField.validation?.minLength || ''}
                              onChange={(e) => updateValidation('minLength', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Length</label>
                            <input
                              type="number"
                              value={selectedField.validation?.maxLength || ''}
                              onChange={(e) => updateValidation('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="255"
                            />
                          </div>
                        </>
                      )}
                      {selectedField.type === 'number' && (
                        <>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Value</label>
                            <input
                              type="number"
                              value={selectedField.validation?.min || ''}
                              onChange={(e) => updateValidation('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Value</label>
                            <input
                              type="number"
                              value={selectedField.validation?.max || ''}
                              onChange={(e) => updateValidation('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="100"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Default Value */}
                {selectedField.type !== 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Value</label>
                    {selectedField.type === 'textarea' ? (
                      <textarea
                        value={selectedField.defaultValue || ''}
                        onChange={(e) => updateField('defaultValue', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Default value..."
                      />
                    ) : (
                      <input
                        type={selectedField.type === 'number' ? 'number' : selectedField.type === 'date' ? 'date' : 'text'}
                        value={selectedField.defaultValue || ''}
                        onChange={(e) => updateField('defaultValue', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Default value"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-12 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Field</h3>
                <p className="text-gray-600">Choose a field from the list to view or edit its details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Custom Fields Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {customFields.filter(f => f.appliesTo === 'invoice' || f.appliesTo === 'all').map(field => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{field.label}</h4>
                    <div className="space-y-2">
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.label}
                          defaultValue={field.defaultValue || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          placeholder={field.label}
                          defaultValue={field.defaultValue || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          defaultValue={field.defaultValue || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                      {field.type === 'dropdown' && (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Select {field.label}</option>
                          {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={field.defaultValue === true} />
                          <span>{field.label}</span>
                        </label>
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.label}
                          defaultValue={field.defaultValue || ''}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                      {field.type === 'file' && (
                        <input
                          type="file"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                    </div>
                    {field.required && (
                      <p className="text-xs text-red-600 mt-1">* Required field</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
