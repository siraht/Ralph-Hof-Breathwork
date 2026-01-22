export type HomeStackParamList = {
  Home: undefined;
  Safety: undefined;
  BreathSession: undefined;
  SessionSummary: undefined;
  ColdExposure: undefined;
  GuidedBreathing: undefined;
};

export type HistoryStackParamList = {
  ResultsTab: undefined;
  SessionDetail: { sessionId: string };
};

export type RootTabParamList = {
  HomeTab: undefined;
  ResultsTab: undefined;
  Settings: undefined;
};
