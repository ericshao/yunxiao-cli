/**
 * CLI 特定的类型定义
 */

export type OutputFormat = 'table' | 'json' | 'csv' | 'markdown';

export type LogLevel = 'debug' | 'verbose' | 'info' | 'warn' | 'error';

export interface CLIConfig {
  defaults: {
    organization_id?: string;
    project_id?: string;
    space_id?: string;
    output_format: OutputFormat;
    editor?: string;
  };
  auth?: {
    access_token?: string;
    organization_id?: string;
    base_url?: string;
  };
  aliases?: Record<string, string>;
}

export interface GlobalOptions {
  verbose?: boolean;
  debug?: boolean;
  json?: boolean;
  output?: OutputFormat;
}

export interface ListWorkitemOptions extends GlobalOptions {
  status?: string;
  assignedTo?: string;
  type?: string;
  labels?: string[];
  sprint?: string;
  page?: number;
  perPage?: number;
}

export interface ViewWorkitemOptions extends GlobalOptions {
  web?: boolean;
  comments?: boolean;
  activities?: boolean;
}

export interface CreateWorkitemOptions extends GlobalOptions {
  subject?: string;
  type?: string;
  assignedTo?: string;
  description?: string;
  labels?: string[];
  sprint?: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  response?: unknown;
}

export interface ListPipelineOptions extends GlobalOptions {
  name?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export interface ViewPipelineOptions extends GlobalOptions {
  // json already covered by GlobalOptions
}

export interface UpdatePipelineOptions extends GlobalOptions {
  name?: string;
  content?: string;
  file?: string;
}

export interface PipelineHistoryOptions extends GlobalOptions {
  category?: string;
  identifier?: string;
  page?: number;
  perPage?: number;
}

export interface RunPipelineOptions extends GlobalOptions {
  branch?: string;
  envs?: string;
  comment?: string;
  params?: string;
}

export interface ListPipelineRunsOptions extends GlobalOptions {
  status?: string;
  triggerMode?: string;
  page?: number;
  perPage?: number;
}

export interface ViewPipelineRunOptions extends GlobalOptions {
  // json covered by GlobalOptions
}

export interface ListPipelineGroupsOptions extends GlobalOptions {
  page?: number;
  perPage?: number;
}

export interface ListPipelineGroupPipelinesOptions extends GlobalOptions {
  name?: string;
  status?: string;
  page?: number;
  perPage?: number;
}
