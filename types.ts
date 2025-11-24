export interface StudentInfo {
  name: string;
  idNumber: string; // Cédula
}

export const CLINICAL_TOPICS = [
  "Detección temprana de cáncer de cuello uterino",
  "Ruta integral de atención en salud materno perinatal",
  "Atención del parto",
  "Atención de emergencias obstétricas",
  "Atención para el cuidado preconcepcional"
] as const;

export type ClinicalTopic = typeof CLINICAL_TOPICS[number];

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  residence: string;
  insuranceType: string; // Regimen contributivo/subsidiado
}

export interface Vitals {
  bp: string; // Blood Pressure
  hr: string; // Heart Rate
  rr: string; // Respiratory Rate
  temp: string; // Temperature
  o2: string; // Saturation
  weight: string;
  height: string;
  bmi: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  topic: string; // Added topic reference
  patientInfo: PatientInfo;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string; // Antecedentes
  familyHistory: string;
  vitals: Vitals;
  physicalExam: string;
  labsAndImages: string; // Can be "No aplica" or specific values
  contextHints: string; // Specific 3280 context hints (e.g. "Primera infancia", "Riesgo cardiovascular")
}

export interface EvaluationResult {
  score: number; // 0 to 5
  positiveAspects: string[];
  areasForImprovement: string[];
  recommendations: string[];
  clinicalSummary: string; // Brief correct approach summary
}

export enum AppState {
  IDLE = 'IDLE',
  REGISTRATION = 'REGISTRATION',
  LOADING_CASE = 'LOADING_CASE',
  ACTIVE_CASE = 'ACTIVE_CASE',
  EVALUATING = 'EVALUATING',
  FEEDBACK = 'FEEDBACK',
  ERROR = 'ERROR'
}