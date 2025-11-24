import React, { useState, useCallback } from 'react';
import { ClinicalCase, EvaluationResult, AppState, StudentInfo, ClinicalTopic } from './types';
import { generateClinicalCase, evaluateMedicalOrders } from './services/geminiService';
import Timer from './components/Timer';
import CaseDetails from './components/CaseDetails';
import FeedbackDisplay from './components/FeedbackDisplay';
import RegistrationForm from './components/RegistrationForm';

const CASE_DURATION_SECONDS = 7 * 60; // 7 minutes

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentCase, setCurrentCase] = useState<ClinicalCase | null>(null);
  const [studentOrders, setStudentOrders] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(CASE_DURATION_SECONDS);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Student Data
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const handleEnterRegistration = () => {
    setAppState(AppState.REGISTRATION);
  };

  const handleStartCase = async (info: StudentInfo, topic: ClinicalTopic) => {
    setStudentInfo(info);
    setAppState(AppState.LOADING_CASE);
    setErrorMsg('');
    try {
      const newCase = await generateClinicalCase(topic);
      setCurrentCase(newCase);
      setStudentOrders('');
      setTimeLeft(CASE_DURATION_SECONDS);
      setAppState(AppState.ACTIVE_CASE);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error generando el caso. Por favor verifica tu conexión o intenta de nuevo.');
      setAppState(AppState.IDLE);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!currentCase) return;

    setAppState(AppState.EVALUATING);
    try {
      const result = await evaluateMedicalOrders(currentCase, studentOrders);
      setEvaluation(result);
      setAppState(AppState.FEEDBACK);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al evaluar. Intenta enviar de nuevo.');
      setAppState(AppState.ACTIVE_CASE); // Return to active to let them try again
    }
  }, [currentCase, studentOrders]);

  const handleTimeUp = useCallback(() => {
    if (appState === AppState.ACTIVE_CASE) {
      handleSubmit();
    }
  }, [appState, handleSubmit]);

  const handleRestart = () => {
    setAppState(AppState.REGISTRATION);
    setEvaluation(null);
    setCurrentCase(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-medical-700 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🏥</span> Simulador Clínico 3280
            </h1>
            <p className="text-medical-100 text-xs md:text-sm mt-1 opacity-90">Atención Primaria en Salud • Colombia</p>
          </div>
          <div className="flex items-center gap-4">
             {studentInfo && (
                <div className="hidden md:block text-right text-xs">
                   <p className="font-bold">{studentInfo.name}</p>
                   <p className="opacity-80">CC: {studentInfo.idNumber}</p>
                </div>
             )}
             {appState !== AppState.IDLE && appState !== AppState.LOADING_CASE && appState !== AppState.REGISTRATION && (
                <div className="text-sm font-medium bg-medical-800 px-3 py-1 rounded hidden md:block">
                  {appState === AppState.ACTIVE_CASE ? 'Caso en curso' : 'Evaluación'}
                </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8 max-w-5xl">
        
        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
            <p>{errorMsg}</p>
          </div>
        )}

        {/* State: IDLE */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl border border-slate-100">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Bienvenido al Simulador</h2>
              <p className="text-slate-600 mb-8 text-lg">
                Pon a prueba tus conocimientos clínicos bajo los lineamientos de la <strong className="text-medical-600">Resolución 3280 de 2018</strong>.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left text-sm text-slate-500">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="block text-xl mb-2">⏱️</span>
                    <strong>7 Minutos</strong>
                    <p>Tiempo límite por caso.</p>
                </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="block text-xl mb-2">📋</span>
                    <strong>Temas Clave</strong>
                    <p>Materno Perinatal, Ca Cuello Uterino, Parto...</p>
                </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="block text-xl mb-2">📄</span>
                    <strong>Reporte PDF</strong>
                    <p>Descarga tu informe al finalizar.</p>
                </div>
              </div>

              <button
                onClick={handleEnterRegistration}
                className="bg-medical-600 hover:bg-medical-700 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-medical-300"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}

        {/* State: REGISTRATION */}
        {appState === AppState.REGISTRATION && (
          <RegistrationForm 
            onStart={handleStartCase} 
            onCancel={() => setAppState(AppState.IDLE)} 
          />
        )}

        {/* State: LOADING */}
        {appState === AppState.LOADING_CASE && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-16 h-16 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mb-4"></div>
             <p className="text-xl text-medical-800 font-medium animate-pulse">Generando paciente...</p>
             <p className="text-sm text-slate-500 mt-2">Consultando guías RIAS para el tema seleccionado...</p>
          </div>
        )}

        {/* State: ACTIVE CASE */}
        {appState === AppState.ACTIVE_CASE && currentCase && (
          <div className="space-y-8 animate-fade-in">
            <Timer 
                durationSeconds={CASE_DURATION_SECONDS}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                onTimeUp={handleTimeUp}
                isActive={true}
            />

            <CaseDetails data={currentCase} />

            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-medical-500">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="bg-medical-100 text-medical-700 p-2 rounded-lg mr-3">📝</span>
                Órdenes Médicas y Conducta
              </h3>
              <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded border border-blue-100">
                <strong>Instrucciones:</strong> Estructure su respuesta de forma ordenada. Asegúrese de cubrir diagnóstico, paraclínicos, tratamiento, educación y signos de alarma.
              </p>
              <textarea
                value={studentOrders}
                onChange={(e) => setStudentOrders(e.target.value)}
                placeholder={`GUÍA DE RESPUESTA SUGERIDA:

1. IMPRESIÓN DIAGNÓSTICA:
   - Diagnóstico principal y diferenciales.

2. PLAN DE MANEJO:
   - Ayudas diagnósticas (Laboratorios/Imágenes).
   - Tratamiento farmacológico (Medicamento, Dosis, Vía, Frecuencia, Duración).
   - Tratamiento no farmacológico.

3. EDUCACIÓN Y SIGNOS DE ALARMA:
   - Recomendaciones específicas según Res. 3280.
   - Signos por los cuales consultar a urgencias.

4. DEFINICIÓN DE CONDUCTA:
   - Ambulatorio, Observación o Remisión.`}
                className="w-full h-80 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent font-mono text-sm resize-y leading-relaxed"
              />
              <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={studentOrders.length < 10}
                    className={`font-bold py-3 px-8 rounded-lg shadow transition-colors ${
                        studentOrders.length < 10 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-medical-600 hover:bg-medical-700 text-white'
                    }`}
                >
                    Finalizar y Evaluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: EVALUATING */}
        {appState === AppState.EVALUATING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
             <p className="text-xl text-purple-800 font-medium animate-pulse">El docente está revisando tu respuesta...</p>
             <p className="text-sm text-slate-500 mt-2">Validando criterios Resolución 3280...</p>
          </div>
        )}

        {/* State: FEEDBACK */}
        {appState === AppState.FEEDBACK && evaluation && currentCase && studentInfo && (
            <FeedbackDisplay 
              result={evaluation} 
              currentCase={currentCase}
              studentInfo={studentInfo}
              studentOrders={studentOrders}
              onRestart={handleRestart} 
            />
        )}

      </main>
    </div>
  );
};

export default App;