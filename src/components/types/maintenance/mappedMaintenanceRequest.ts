import { AlertInfoType } from "./requestHistory";

export interface MappedMaintenanceRequest {
  id: number;
  number_request: string;
  school: string;
  description: string;
  category: string;
  priority: string;
  status: { name: string; color: string };
  dateTime: string;
  assignedTo?: string;
  year: number;
  timeToStart: string;
  timeToFinish: string;
  priorityIndicator?: { name: string; color: string };
  alert_info?: AlertInfoType;
}
