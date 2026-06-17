/**
 * 阿里云效工作项相关类型定义
 * 基于 API 文档: https://help.aliyun.com/zh/yunxiao/developer-reference/work-items/
 */

export interface YunxiaoUser {
  id: string;
  name: string;
}

export interface WorkitemStatus {
  id: string;
  name: string;
  category: string;
}

export interface WorkitemType {
  id: string;
  name: string;
  category: string;
}

export interface Sprint {
  id: string;
  name: string;
  startTime?: string;
  endTime?: string;
}

export interface CustomFieldValue {
  fieldIdentifier: string;
  value: string | number | boolean | string[] | number[];
  displayValue?: string;
}

export interface Workitem {
  id: string;
  serialNumber: string;
  subject: string;
  description?: string;
  assignedTo?: YunxiaoUser;
  creator: YunxiaoUser;
  status: WorkitemStatus;
  workitemType: WorkitemType;
  categoryId: string;
  parentId?: string;
  idPath?: string;
  spaceId: string;
  sprint?: Sprint;
  logicalStatus: string;
  formatType: string;
  customFieldValues?: CustomFieldValue[];
  labels?: string[];
  versions?: string[];
  participants?: string[];
  trackers?: string[];
  verifier?: string;
  gmtCreate: string;
  gmtModified: string;
}

export interface SearchWorkitemsRequest {
  spaceId: string;
  category: string; // 多值用逗号隔开: "Req,Task,Bug"
  conditions?: string; // JSON 字符串
  orderBy?: string; // 默认为 gmtCreate
  page?: number; // 默认为 1
  perPage?: number; // 默认为 20
  sort?: 'desc' | 'asc'; // 默认为 desc
}

export interface SearchWorkitemsResponse {
  data: Workitem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateWorkitemRequest {
  spaceId: string;
  workitemTypeId: string;
  subject: string;
  description?: string;
  assignedTo?: string;
  parentId?: string;
  sprint?: string;
  verifier?: string;
  customFieldValues?: Record<string, string | number | boolean | string[] | number[]>;
  labels?: string[];
  versions?: string[];
  participants?: string[];
  trackers?: string[];
}

export interface CreateWorkitemResponse {
  id: string;
}

export interface UpdateWorkitemRequest {
  [field: string]: string | number | boolean | string[] | number[];
}

export interface WorkitemActivity {
  eventId: number;
  eventTime: string;
  eventType: string;
  actionType: 'created' | 'updated' | 'delete' | 'associate' | 'unassociate';
  operator: YunxiaoUser;
  resourceId: string;
  property?: {
    identifier: string;
    displayName: string;
  };
  oldValue?: (string | number | boolean)[];
  newValue?: (string | number | boolean)[];
  relatedResource?: Record<string, unknown>;
}

export interface WorkitemComment {
  id: string;
  content: string;
  contentFormat: 'RICHTEXT' | 'MARKDOWN';
  parentId?: string;
  top: boolean;
  user: YunxiaoUser;
  gmtCreate: string;
  gmtModified: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
  operatorId?: string;
}

export interface CreateCommentResponse {
  id: string;
}

export interface WorkitemAttachment {
  id: string;
  fileId: string;
  fileName: string;
  size: number;
  suffix: string;
  url: string;
  creator: YunxiaoUser;
  modifier: YunxiaoUser;
  gmtCreate: string;
  gmtModified: string;
}

export interface WorkitemFile {
  id: string;
  name: string;
  size: number;
  suffix: string;
  url: string;
}

// 条件查询过滤器接口
export interface ConditionFilter {
  fieldIdentifier: string;
  operator: 'CONTAINS' | 'NOT_CONTAINS' | 'EQUALS' | 'NOT_EQUALS' | 'GT' | 'GTE' | 'LT' | 'LTE';
  value: (string | number | boolean)[];
  toValue?: string | number | boolean;
  className: string;
  format: 'list' | 'single' | 'range';
}

export interface ConditionGroup {
  conditionGroups: ConditionFilter[][];
}

// API 配置
export interface YunxiaoConfig {
  organizationId: string;
  accessToken: string;
  baseURL: string;
}

// ============ Flow 服务连接/凭据相关类型 ============

export interface ServiceConnection {
  id: number;
  uuid?: string;
  name: string;
  type: string;
  ownerAccountId?: string;
  ownerStaffId?: string;
  createTime?: number;
}

export interface ListServiceConnectionsRequest {
  // API 文档中的参数名为 sericeConnectionType（少了 v），需要原样使用。
  sericeConnectionType?: string;
}

export interface ServiceCredential {
  id: number;
  type: string;
  name?: string;
  ownerName?: string;
  ownerStaffId?: string;
  editable?: boolean;
  createTime?: number;
}

export interface ListServiceCredentialsRequest {
  serviceCredentialType?: string;
}

// ============ 流水线相关类型 ============

// 流水线列表项
export interface Pipeline {
  pipelineId: number;
  pipelineName: string;
  createAccountId: string;
  createTime: number;
}

// 流水线详情
export interface PipelineDetail {
  name: string;
  createTime: number;
  updateTime: number;
  creatorAccountId: string;
  modifierAccountId: string;
  envId: number;
  envName: string;
  groupId: number;
  type: string | null; // 'PIPELINEASCODE' 表示 yaml 流水线, null 表示 UI 流水线
  pipelineConfig: {
    flow: string;
    settings: string;
    sources: PipelineSource[];
  };
  tagList: PipelineTag[];
}

export interface PipelineSource {
  sign: string;
  type: string; // 'Codeup' | 'aliyunGit' | 'customGitlab' | 'giteeGit' | 'git' | 'gitlab' | 'bitbucket' | 'githubOAuth'
  data: {
    branch: string;
    repo: string;
    label: string;
    isTrigger: boolean;
    triggerFilter: string;
    cloneDepth?: number;
    credentialId?: number;
    credentialLabel?: string;
    credentialType?: string;
    events?: string[];
    isBranchMode?: boolean;
    isCloneDepth?: boolean;
    isSubmodule?: boolean;
    namespace?: string;
    serviceConnectionId?: number;
    webhook?: string;
    [key: string]: unknown;
  };
}

export interface PipelineTag {
  id: number;
  name: string;
}

// 流水线任务执行历史
export interface PipelineJobHistory {
  executeNumber: number;
  identifier: string;
  jobId: number;
  jobName: string;
  operatorAccountId: string;
  pipelineId: number;
  pipelineRunId: number;
  sources: string;
  status: string; // 'SUCCESS' | 'RUNNING' | 'FAIL' | 'CANCELED' | 'WAITING'
}

// 流水线任务运行日志
export interface PipelineJobRunLog {
  content: string;
  last: number;
  more: boolean;
}

// 流水线请求参数
export interface ListPipelinesRequest {
  pipelineName?: string;
  statusList?: string; // 多个逗号分割: 'SUCCESS,RUNNING,FAIL,CANCELED,WAITING'
  createStartTime?: number;
  createEndTime?: number;
  executeStartTime?: number;
  executeEndTime?: number;
  page?: number;
  perPage?: number;
}

export interface UpdatePipelineRequest {
  name: string;
  content: string; // 流水线 YAML 描述
}

export interface CreatePipelineRequest {
  name: string;
  content: string; // 流水线 YAML 描述
}

export interface ListPipelineJobHistorysRequest {
  pipelineId: string;
  category: string; // 暂时只支持 'DEPLOY'
  identifier: string;
  page?: number;
  perPage?: number;
}

// ============ 流水线运行实例相关类型 ============

// 流水线运行实例列表项
export interface PipelineRun {
  pipelineId: number;
  pipelineRunId: number;
  creatorAccountId: string;
  startTime: number;
  endTime: number;
  triggerMode: number; // 1人工 2定时 3代码提交 5流水线 6WEBHOOK
}

// 流水线运行实例详情
export interface PipelineRunDetail {
  pipelineId: number;
  pipelineRunId: number;
  status: string; // 'FAIL' | 'SUCCESS' | 'RUNNING'
  triggerMode: number;
  pipelineType: string;
  creatorAccountId: string;
  modifierAccountId: string;
  createTime: number;
  updateTime: number;
  globalParams: PipelineRunParam[];
  groups: PipelineRunGroup[];
  sources: PipelineRunSource[];
  stageGroup: string[];
  stages: PipelineRunStage[];
}

export interface PipelineRunParam {
  key: string;
  value: string;
  encrypted: boolean;
}

export interface PipelineRunGroup {
  id: number;
  name: string;
}

export interface PipelineRunSource {
  sign: string;
  type: string;
  name: string;
  data: {
    branch: string;
    repo: string;
    label: string;
    isTrigger: boolean;
    [key: string]: unknown;
  };
}

export interface PipelineRunStage {
  index: string;
  name: string;
  stageInfo: {
    name: string;
    status: string;
    startTime: number;
    endTime: number;
    jobs: PipelineRunJob[];
  };
}

export interface PipelineRunJob {
  id: number;
  name: string;
  jobSign: string;
  status: string;
  startTime: number;
  endTime: number;
  params: string;
  result: string;
  actions: PipelineRunAction[];
}

export interface PipelineRunAction {
  name: string;
  title: string;
  type: string;
  displayType: string;
  disable: boolean;
  order: number;
  data: string;
  params: Record<string, string>;
}

// 运行流水线请求参数
export interface CreatePipelineRunRequest {
  params?: string; // JSON 字符串
}

// 列出运行实例请求参数
export interface ListPipelineRunsRequest {
  pipelineId: string;
  page?: number;
  perPage?: number;
  startTime?: number;
  endTme?: number; // 注意: API 文档中就是 endTme（typo），需要原样使用
  status?: string;
  triggerMode?: number;
}

// ============ 流水线分组相关类型 ============

export interface PipelineGroup {
  id: number;
  name: string;
  gmtCreate: number;
}

export interface PipelineGroupPipeline {
  pipelineId: number;
  pipelineName: string;
  gmtCreate: number;
}

export interface ListPipelineGroupsRequest {
  page?: number;
  perPage?: number;
}

export interface ListPipelineGroupPipelinesRequest {
  groupId: number;
  pipelineName?: string;
  statusList?: string;
  createStartTime?: number;
  createEndTime?: number;
  executeStartTime?: number;
  executeEndTime?: number;
  page?: number;
  perPage?: number;
}

export interface AddToPipelineGroupRequest {
  groupId: number;
  pipelineIds: string;
}
