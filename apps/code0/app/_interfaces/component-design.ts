export interface ComponentDesign {
  name: string;
  description: {
    by_user: string;
    by_llm: string;
  };
  icons: string[];
  libraries: {
    name: string;
    reason: string;
  }[];
}
