import React from 'react';
import { EvaluationResult, ClinicalCase, StudentInfo } from '../types';
import { jsPDF } from 'jspdf';

interface FeedbackDisplayProps {
  result: EvaluationResult;
  currentCase: ClinicalCase;
  studentInfo: StudentInfo;
  studentOrders: string;
  onRestart: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ result, currentCase, studentInfo, studentOrders, onRestart }) => {
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    let yPos = 20;

    const checkPageBreak = (heightNeeded: number) => {
      if (yPos + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000', indent: number = 0) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxLineWidth - indent);
      const lineHeight = fontSize * 0.5; // Approximate line height conversion
      const blockHeight = lines.length * lineHeight + 2;

      checkPageBreak(blockHeight);

      doc.text(lines, margin + indent, yPos);
      yPos += blockHeight;
    };

    const addSeparator = () => {
      checkPageBreak(10);
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
    };

    // --- HEADER ---
    addText("INFORME DE SIMULACIÓN CLÍNICA - RES. 3280", 16, true, '#0369a1');
    yPos += 2;
    addText(`Fecha de Generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, false, '#64748b');
    addSeparator();

    // --- STUDENT INFO ---
    addText("INFORMACIÓN DEL ESTUDIANTE", 12, true, '#333333');
    addText(`Nombre: ${studentInfo.name}`);
    addText(`Cédula: ${studentInfo.idNumber}`);
    addText(`Tema Asignado: ${currentCase.topic}`, 10, true, '#0ea5e9');
    yPos += 5;

    // --- CASE DETAILS ---
    addText("DETALLES DEL CASO CLÍNICO", 12, true, '#333333');
    addText(`Título: ${currentCase.title}`, 10, true);
    addText(`Paciente: ${currentCase.patientInfo.name}, ${currentCase.patientInfo.age}, ${currentCase.patientInfo.gender}.`, 10);
    addText(`Ocupación: ${currentCase.patientInfo.occupation} | Régimen: ${currentCase.patientInfo.insuranceType}`);
    yPos += 2;
    
    addText("Motivo de Consulta:", 10, true);
    addText(currentCase.chiefComplaint, 10, false, '#475569');
    yPos += 2;

    addText("Enfermedad Actual:", 10, true);
    addText(currentCase.historyOfPresentIllness, 10, false, '#475569');
    yPos += 2;

    addText("Antecedentes:", 10, true);
    addText(`Personales: ${currentCase.pastMedicalHistory}`, 9);
    addText(`Familiares: ${currentCase.familyHistory}`, 9);
    yPos += 2;

    addText("Signos Vitales y Físico:", 10, true);
    const vitalsStr = `TA: ${currentCase.vitals.bp} | FC: ${currentCase.vitals.hr} | FR: ${currentCase.vitals.rr} | T: ${currentCase.vitals.temp}°C | SatO2: ${currentCase.vitals.o2}% | IMC: ${currentCase.vitals.bmi}`;
    addText(vitalsStr, 9, false, '#000000');
    addText(currentCase.physicalExam, 9, false, '#475569');
    yPos += 2;

    addText("Paraclínicos:", 10, true);
    addText(currentCase.labsAndImages, 9, false, '#475569');
    
    addSeparator();

    // --- STUDENT ANSWER ---
    addText("RESPUESTA DEL ESTUDIANTE (ÓRDENES MÉDICAS)", 12, true, '#333333');
    // Using a monospaced font feeling for the student input
    doc.setFont("courier", "normal"); 
    addText(studentOrders, 9, false, '#1e293b');
    doc.setFont("helvetica", "normal"); // Reset font
    
    addSeparator();

    // --- EVALUATION ---
    addText("EVALUACIÓN Y RETROALIMENTACIÓN", 12, true, '#333333');
    
    const scoreColor = result.score >= 3 ? '#16a34a' : '#dc2626';
    addText(`CALIFICACIÓN FINAL: ${result.score.toFixed(1)} / 5.0`, 14, true, scoreColor);
    yPos += 2;

    addText("Resumen de Manejo Ideal:", 10, true);
    addText(result.clinicalSummary, 10, false, '#475569');
    yPos += 4;

    addText("Aspectos Positivos:", 10, true, '#15803d');
    result.positiveAspects.forEach(item => addText(`• ${item}`, 9, false, '#1e293b', 5));
    yPos += 2;

    addText("Oportunidades de Mejora:", 10, true, '#c2410c');
    result.areasForImprovement.forEach(item => addText(`• ${item}`, 9, false, '#1e293b', 5));
    yPos += 2;

    addText("Recomendaciones (Res. 3280):", 10, true, '#1d4ed8');
    result.recommendations.forEach(item => addText(`-> ${item}`, 9, false, '#1e293b', 5));

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} - Simulador Clínico 3280`, margin, pageHeight - 10);
    }

    doc.save(`Reporte_Caso_${studentInfo.idNumber}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center text-center ${getScoreColor(result.score)}`}>
        <span className="text-sm uppercase font-bold tracking-widest opacity-80">Calificación Global</span>
        <div className="text-6xl font-black my-2">{result.score.toFixed(1)}<span className="text-2xl text-slate-400 font-normal">/5.0</span></div>
        <p className="font-medium max-w-lg">{result.clinicalSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="flex items-center text-green-700 font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Aspectos Positivos
          </h3>
          <ul className="space-y-2">
            {result.positiveAspects.map((item, idx) => (
              <li key={idx} className="text-slate-600 text-sm flex items-start">
                <span className="mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="flex items-center text-orange-600 font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Oportunidades de Mejora
          </h3>
          <ul className="space-y-2">
            {result.areasForImprovement.map((item, idx) => (
              <li key={idx} className="text-slate-600 text-sm flex items-start">
                <span className="mr-2">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="flex items-center text-blue-800 font-bold mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Recomendaciones Académicas (Res. 3280/2018)
        </h3>
        <ul className="space-y-2">
          {result.recommendations.map((item, idx) => (
            <li key={idx} className="text-blue-900 text-sm italic flex items-start">
              <span className="mr-2 font-bold">→</span>{item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center gap-4 pt-8 pb-12 flex-wrap">
        <button
          onClick={handleDownloadPDF}
          className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar Informe PDF
        </button>

        <button
          onClick={onRestart}
          className="bg-medical-600 hover:bg-medical-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
        >
          Iniciar Nuevo Caso Clínico
        </button>
      </div>
    </div>
  );
};

export default FeedbackDisplay;