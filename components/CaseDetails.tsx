import React from 'react';
import { ClinicalCase } from '../types';

interface CaseDetailsProps {
  data: ClinicalCase;
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-sm font-bold text-medical-600 uppercase tracking-wider mb-2 mt-4 border-b border-medical-100 pb-1">
    {title}
  </h3>
);

const CaseDetails: React.FC<CaseDetailsProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-medical-50 p-6 border-b border-medical-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{data.title}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="bg-white px-3 py-1 rounded-full border border-medical-200 font-medium">
            {data.patientInfo.name}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-semibold">Edad:</span> {data.patientInfo.age}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-semibold">Sexo:</span> {data.patientInfo.gender}
          </span>
           <span className="flex items-center gap-1">
            <span className="font-semibold">Ocupación:</span> {data.patientInfo.occupation}
          </span>
           <span className="flex items-center gap-1">
            <span className="font-semibold">Aseguradora:</span> {data.patientInfo.insuranceType}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: History */}
        <div className="md:col-span-2 space-y-2">
            <SectionTitle title="Motivo de Consulta" />
            <p className="text-slate-700 italic">"{data.chiefComplaint}"</p>

            <SectionTitle title="Enfermedad Actual" />
            <p className="text-slate-700 leading-relaxed text-justify">{data.historyOfPresentIllness}</p>

            <SectionTitle title="Antecedentes Personales" />
            <p className="text-slate-700 text-sm">{data.pastMedicalHistory}</p>

             <SectionTitle title="Antecedentes Familiares" />
            <p className="text-slate-700 text-sm">{data.familyHistory}</p>
        </div>

        {/* Right Column: Objective Data */}
        <div className="bg-slate-50 p-4 rounded-lg h-fit">
            <SectionTitle title="Signos Vitales" />
            <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div><span className="text-slate-500 block">PA</span> <span className="font-bold text-slate-800">{data.vitals.bp} mmHg</span></div>
                <div><span className="text-slate-500 block">FC</span> <span className="font-bold text-slate-800">{data.vitals.hr} lpm</span></div>
                <div><span className="text-slate-500 block">FR</span> <span className="font-bold text-slate-800">{data.vitals.rr} rpm</span></div>
                <div><span className="text-slate-500 block">Temp</span> <span className="font-bold text-slate-800">{data.vitals.temp}°C</span></div>
                <div><span className="text-slate-500 block">SatO2</span> <span className="font-bold text-slate-800">{data.vitals.o2}%</span></div>
                <div><span className="text-slate-500 block">IMC</span> <span className="font-bold text-slate-800">{data.vitals.bmi}</span></div>
            </div>

            <SectionTitle title="Examen Físico Relevante" />
            <p className="text-sm text-slate-700">{data.physicalExam}</p>

            <SectionTitle title="Paraclínicos / Imágenes" />
            <p className="text-sm text-slate-700">{data.labsAndImages}</p>
            
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <strong>Pista de Contexto:</strong> {data.contextHints}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
