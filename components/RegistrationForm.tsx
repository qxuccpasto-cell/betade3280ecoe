import React, { useState } from 'react';
import { CLINICAL_TOPICS, ClinicalTopic, StudentInfo } from '../types';

interface RegistrationFormProps {
  onStart: (info: StudentInfo, topic: ClinicalTopic) => void;
  onCancel: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onStart, onCancel }) => {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ClinicalTopic>(CLINICAL_TOPICS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && idNumber.trim()) {
      onStart({ name, idNumber }, selectedTopic);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Registro de Estudiante</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none"
              placeholder="Ej: Pepito Pérez"
            />
          </div>

          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-slate-700 mb-1">
              Número de Cédula
            </label>
            <input
              type="text"
              id="idNumber"
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none"
              placeholder="Ej: 123456789"
            />
          </div>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-2">
            Seleccione el Tema del Caso Clínico
          </label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value as ClinicalTopic)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-white"
          >
            {CLINICAL_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-2">
            Basado en las Rutas Integrales de Atención en Salud (RIAS) - Resolución 3280 de 2018.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-6 rounded-lg font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-md transition-transform transform hover:scale-105"
          >
            Comenzar Evaluación
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;