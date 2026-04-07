export interface MaintenanceCategory {
  id: number;
  name: string;
}

export interface MaintenancePriority {
  id: number;
  name: string;
  color?: string;
  estimated_time_start_type?: string | null;
  estimated_time_start_value?: number | null;
  estimated_time_finish_type?: string | null;
  estimated_time_finish_value?: number | null;
}

export interface MaintenanceStatus {
  id: number;
  name: string;
  color?: string;
}

export interface Unit {
  id: number;
  name: string;
}

export interface RequestedBy {
  id: number;
  name: string;
}

export interface MaintenanceAttachment {
  id: number;
  file_path: string;
  file_time_position: "BEFORE_SERVICE" | "AFTER_SERVICE";
  file_url: string;
}

export interface AlertInfoType {
  is_alert?: boolean;
  finish_time_expired?: boolean;
  start_time_expired?: boolean;
}
export interface MaintenanceRequest {
  id: number;
  number_request: string;
  description: string | null;
  year: number;
  requested_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  service_protocol?: any;
  service_observations?: any;
  MaintenanceCategories?: MaintenanceCategory | null;
  MaintenancePriorities?: MaintenancePriority | null;
  priority_history?: {
    captured_at: string;
    current?: {
      time_start_type?: string | null;
      time_start_value?: number | null;
      time_finish_type?: string | null;
      time_finish_value?: number | null;
    };
    previous?: {
      time_start_type?: string | null;
      time_start_value?: number | null;
      time_finish_type?: string | null;
      time_finish_value?: number | null;
    };
    has_changes: boolean;
  };
  MaintenanceStatus?: MaintenanceStatus | null;
  Unit?: Unit | null;
  requestedBy?: RequestedBy | null;
  assigned_to?: string | null;
  MaintenanceAttachments?: MaintenanceAttachment[];
  alert_info?: AlertInfoType;
}

export interface MaintenanceRequestByIdResponse {
  data: MaintenanceRequest;
  errorMessages: string[];
}

export interface MaintenanceRequestListResponse {
  data: MaintenanceRequest[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  errorMessages: string[];
}
