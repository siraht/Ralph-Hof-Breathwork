export type HomeStackParamList = {
  Home: undefined;
  Safety: undefined;
  BreathSession: undefined;
  SessionSummary: undefined;
  ColdExposure: undefined;
};

export type HistoryStackParamList = {
  History: undefined;
  SessionDetail: { sessionId: string };
};

export type RootTabParamList = {
  HomeTab: undefined;
  History: undefined;
  Settings: undefined;
};
