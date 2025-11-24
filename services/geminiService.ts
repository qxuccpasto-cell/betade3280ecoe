import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ClinicalCase, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CASE_GENERATION_MODEL = "gemini-2.5-flash";
const EVALUATION_MODEL = "gemini-2.5-flash";

// Schema for Clinical Case Generation
const clinicalCaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Un título clínico descriptivo" },
    patientInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        age: { type: Type.STRING },
        gender: { type: Type.STRING },
        occupation: { type: Type.STRING },
        residence: { type: Type.STRING },
        insuranceType: { type: Type.STRING, description: "Regimen Contributivo o Subsidiado" },
      },
      required: ["name", "age", "gender", "occupation", "insuranceType"]
    },
    chiefComplaint: { type: Type.STRING, description: "Motivo de consulta en palabras del paciente" },
    historyOfPresentIllness: { type: Type.STRING, description: "Enfermedad actual detallada" },
    pastMedicalHistory: { type: Type.STRING, description: "Antecedentes patológicos, quirúrgicos, alérgicos, tóxicos" },
    familyHistory: { type: Type.STRING },
    vitals: {
      type: Type.OBJECT,
      properties: {
        bp: { type: Type.STRING },
        hr: { type: Type.STRING },
        rr: { type: Type.STRING },
        temp: { type: Type.STRING },
        o2: { type: Type.STRING },
        weight: { type: Type.STRING },
        height: { type: Type.STRING },
        bmi: { type: Type.STRING },
      },
      required: ["bp", "hr", "rr", "temp", "weight", "height"]
    },
    physicalExam: { type: Type.STRING, description: "Hallazgos positivos y negativos relevantes al examen físico" },
    labsAndImages: { type: Type.STRING, description: "Paraclínicos que trae el paciente o 'No aporta'" },
    contextHints: { type: Type.STRING, description: "Contexto de la ruta de atención (Ej: Ruta Materno Perinatal, etc)" }
  },
  required: ["title", "patientInfo", "chiefComplaint", "historyOfPresentIllness", "pastMedicalHistory", "vitals", "physicalExam"]
};

// Schema for Evaluation
const evaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Puntuación de 0 a 5" },
    positiveAspects: { type: Type.ARRAY, items: { type: Type.STRING } },
    areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recomendaciones específicas basadas en Res 3280" },
    clinicalSummary: { type: Type.STRING, description: "Resumen breve del manejo ideal según la norma" }
  },
  required: ["score", "positiveAspects", "areasForImprovement", "recommendations", "clinicalSummary"]
};

export const generateClinicalCase = async (topic: string): Promise<ClinicalCase> => {
  const prompt = `
    Genera un caso clínico aleatorio para un estudiante de medicina en contexto de ATENCIÓN PRIMARIA EN SALUD en COLOMBIA.
    
    El caso debe estar alineado con la Resolución 3280 de 2018 (Rutas Integrales de Atención en Salud - RIAS).
    
    El tema ESPECÍFICO del caso debe ser: "${topic}".
    
    Asegúrate de:
    1. Que los signos vitales sean coherentes con la historia y la patología del tema seleccionado.
    2. Usar terminología médica adecuada pero realista para una consulta de primer nivel o urgencia baja según corresponda al tema.
    3. Si es "Atención del parto" o "Emergencia obstétrica", sitúa el caso en un contexto donde el médico de atención primaria deba actuar inicialmente.
  `;

  try {
    const response = await ai.models.generateContent({
      model: CASE_GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: clinicalCaseSchema,
        temperature: 0.8,
      }
    });

    const caseData = JSON.parse(response.text || "{}");
    return { ...caseData, id: crypto.randomUUID(), topic: topic };
  } catch (error) {
    console.error("Error generating case:", error);
    throw new Error("No se pudo generar el caso clínico. Intenta nuevamente.");
  }
};

export const evaluateMedicalOrders = async (clinicalCase: ClinicalCase, studentOrders: string): Promise<EvaluationResult> => {
  const prompt = `
    Actúa como un profesor estricto de medicina familiar y obstetricia en Colombia.
    
    Evalúa las órdenes médicas ingresadas por el estudiante para el siguiente caso clínico:
    
    TEMA: ${clinicalCase.topic}
    PACIENTE: ${clinicalCase.patientInfo.age} ${clinicalCase.patientInfo.gender}.
    DIAGNÓSTICO PROBABLE: Basado en ${clinicalCase.chiefComplaint} y ${clinicalCase.historyOfPresentIllness}.
    CONTEXTO: ${clinicalCase.contextHints}.
    
    ÓRDENES DEL ESTUDIANTE:
    "${studentOrders}"
    
    CRITERIOS DE EVALUACIÓN (Resolución 3280 de 2018):
    1. ¿Identificó el riesgo o diagnóstico correcto acorde al tema "${clinicalCase.topic}"?
    2. ¿Solicitó los paraclínicos adecuados para el nivel de complejidad?
    3. ¿El tratamiento y conducta son acordes a las RIAS (Ruta Materno Perinatal, Promoción y Mantenimiento, etc)?
    4. ¿Incluyó educación al paciente y signos de alarma?
    
    Califica de 0.0 a 5.0. Sé constructivo pero riguroso con la normativa.
    Si el estudiante dejó el campo vacío o escribió disparates, califica con 0 o 1.
  `;

  try {
    const response = await ai.models.generateContent({
      model: EVALUATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
        temperature: 0.4,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error evaluating orders:", error);
    throw new Error("Error al evaluar las órdenes. Intenta nuevamente.");
  }
};