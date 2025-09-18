import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IControleDeFeriasProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}