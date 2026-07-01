import { create } from 'zustand';
import type { AnalyzeImageResponse, DiagnoseRequestPayload, DiagnoseResponse } from '../services/types';

interface RepairSessionState {
  capturedImageUri: string | null;
  userHint: string | null;
  pendingDiagnoseRequest: DiagnoseRequestPayload | null;
  analyzeResult: AnalyzeImageResponse | null;
  diagnoseResult: DiagnoseResponse | null;
  currentStepIndex: number;
  isAnalyzing: boolean;
  isDiagnosing: boolean;
  errorMessage: string | null;

  setCapturedImage: (uri: string | null) => void;
  setUserHint: (hint: string | null) => void;
  setPendingDiagnoseRequest: (payload: DiagnoseRequestPayload | null) => void;
  setAnalyzeResult: (result: AnalyzeImageResponse | null) => void;
  setDiagnoseResult: (result: DiagnoseResponse | null) => void;
  setAnalyzing: (value: boolean) => void;
  setDiagnosing: (value: boolean) => void;
  setError: (message: string | null) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  reset: () => void;
}

export const useRepairSessionStore = create<RepairSessionState>((set, get) => ({
  capturedImageUri: null,
  userHint: null,
  pendingDiagnoseRequest: null,
  analyzeResult: null,
  diagnoseResult: null,
  currentStepIndex: 0,
  isAnalyzing: false,
  isDiagnosing: false,
  errorMessage: null,

  setCapturedImage: (uri) => set({ capturedImageUri: uri }),
  setUserHint: (hint) => set({ userHint: hint }),
  setPendingDiagnoseRequest: (payload) => set({ pendingDiagnoseRequest: payload }),
  setAnalyzeResult: (result) => set({ analyzeResult: result }),
  setDiagnoseResult: (result) => set({ diagnoseResult: result, currentStepIndex: 0 }),
  setAnalyzing: (value) => set({ isAnalyzing: value }),
  setDiagnosing: (value) => set({ isDiagnosing: value }),
  setError: (message) => set({ errorMessage: message }),
  goToNextStep: () => {
    const { currentStepIndex, diagnoseResult } = get();
    const maxIndex = (diagnoseResult?.steps.length ?? 1) - 1;
    set({ currentStepIndex: Math.min(currentStepIndex + 1, Math.max(maxIndex, 0)) });
  },
  goToPreviousStep: () => {
    const { currentStepIndex } = get();
    set({ currentStepIndex: Math.max(currentStepIndex - 1, 0) });
  },
  reset: () =>
    set({
      capturedImageUri: null,
      userHint: null,
      pendingDiagnoseRequest: null,
      analyzeResult: null,
      diagnoseResult: null,
      currentStepIndex: 0,
      isAnalyzing: false,
      isDiagnosing: false,
      errorMessage: null,
    }),
}));
