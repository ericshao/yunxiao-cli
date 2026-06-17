/**
 * 阿里云效 Yunxiao API 客户端
 * 实现工作项相关的 API 调用封装
 */

import {
  YunxiaoConfig,
  Workitem,
  SearchWorkitemsRequest,
  SearchWorkitemsResponse,
  CreateWorkitemRequest,
  CreateWorkitemResponse,
  UpdateWorkitemRequest,
  WorkitemActivity,
  WorkitemComment,
  CreateCommentRequest,
  CreateCommentResponse,
  WorkitemAttachment,
  WorkitemFile,
  ServiceConnection,
  ListServiceConnectionsRequest,
  ServiceCredential,
  ListServiceCredentialsRequest,
  Pipeline,
  PipelineDetail,
  PipelineJobHistory,
  ListPipelinesRequest,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  ListPipelineJobHistorysRequest,
  PipelineRun,
  PipelineRunDetail,
  PipelineJobRunLog,
  CreatePipelineRunRequest,
  ListPipelineRunsRequest,
  PipelineGroup,
  PipelineGroupPipeline,
  ListPipelineGroupsRequest,
  ListPipelineGroupPipelinesRequest,
  AddToPipelineGroupRequest,
} from '../types/yunxiao';

export class YunxiaoApiClient {
  private config: YunxiaoConfig;

  constructor(config: YunxiaoConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-yunxiao-token': this.config.accessToken,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Yunxiao API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // 某些接口（如删除）可能返回空响应
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return {} as T;
  }

  /**
   * 搜索工作项
   */
  async searchWorkitems(searchParams: SearchWorkitemsRequest): Promise<SearchWorkitemsResponse> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems:search`;

    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Yunxiao API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const workitems = await response.json();

    // 从响应头中提取分页信息
    const pagination = {
      page: parseInt(response.headers.get('x-page') || '1'),
      perPage: parseInt(response.headers.get('x-per-page') || '20'),
      total: parseInt(response.headers.get('x-total') || '0'),
      totalPages: parseInt(response.headers.get('x-total-pages') || '0'),
      hasNextPage: !!response.headers.get('x-next-page'),
      hasPrevPage: !!response.headers.get('x-prev-page'),
    };

    return {
      data: Array.isArray(workitems) ? workitems : [],
      pagination,
    };
  }

  /**
   * 获取单个工作项详情
   */
  async getWorkitem(id: string): Promise<Workitem> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}`;
    return this.request<Workitem>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 创建工作项
   */
  async createWorkitem(workitem: CreateWorkitemRequest): Promise<CreateWorkitemResponse> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems`;
    return this.request<CreateWorkitemResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(workitem),
    });
  }

  /**
   * 更新工作项
   */
  async updateWorkitem(id: string, updates: UpdateWorkitemRequest): Promise<void> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}`;
    await this.request<void>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * 删除工作项
   */
  async deleteWorkitem(id: string): Promise<void> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}`;
    await this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * 获取工作项活动历史
   */
  async getWorkitemActivities(id: string): Promise<WorkitemActivity[]> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}/activities`;
    return this.request<WorkitemActivity[]>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 获取工作项评论列表
   */
  async getWorkitemComments(id: string): Promise<WorkitemComment[]> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}/comments`;
    return this.request<WorkitemComment[]>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 创建工作项评论
   */
  async createWorkitemComment(
    id: string,
    comment: CreateCommentRequest
  ): Promise<CreateCommentResponse> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}/comments`;
    return this.request<CreateCommentResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  /**
   * 获取工作项附件列表
   */
  async getWorkitemAttachments(id: string): Promise<WorkitemAttachment[]> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${id}/attachments`;
    return this.request<WorkitemAttachment[]>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 获取工作项文件信息
   */
  async getWorkitemFile(workitemId: string, fileId: string): Promise<WorkitemFile> {
    const endpoint = `/organizations/${this.config.organizationId}/workitems/${workitemId}/files/${fileId}`;
    return this.request<WorkitemFile>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 获取 Flow API 基础路径
   * 流水线 API 使用 /oapi/v1/flow 而非 /oapi/v1/projex
   */
  private getFlowBaseURL(): string {
    return this.config.baseURL.replace('/projex', '/flow');
  }

  /**
   * Flow API 原始请求（返回 Response 以便提取响应头中的分页信息）
   */
  private async flowRequestRaw(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.getFlowBaseURL()}${endpoint}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Yunxiao API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response;
  }

  /**
   * Flow API 请求（直接返回解析后的 JSON）
   */
  private async flowRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await this.flowRequestRaw(endpoint, options);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    const text = await response.text();
    if (text) {
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as T;
      }
    }

    return {} as T;
  }

  /**
   * 从响应头中提取分页信息
   */
  private extractPagination(response: Response) {
    return {
      page: parseInt(response.headers.get('x-page') || '1'),
      perPage: parseInt(response.headers.get('x-per-page') || '10'),
      total: parseInt(response.headers.get('x-total') || '0'),
      totalPages: parseInt(response.headers.get('x-total-pages') || '0'),
      hasNextPage: !!response.headers.get('x-next-page'),
      hasPrevPage: !!response.headers.get('x-prev-page'),
    };
  }

  // ============ Flow 服务连接/凭据相关 API ============

  /**
   * 获取服务连接列表
   */
  async listServiceConnections(
    params: ListServiceConnectionsRequest = {}
  ): Promise<ServiceConnection[]> {
    const queryParams = new URLSearchParams();
    if (params.sericeConnectionType) {
      queryParams.set('sericeConnectionType', params.sericeConnectionType);
    }

    const queryString = queryParams.toString();
    const endpoint = `/organizations/${this.config.organizationId}/serviceConnections${queryString ? '?' + queryString : ''}`;
    const connections = await this.flowRequest<ServiceConnection[]>(endpoint, { method: 'GET' });

    return Array.isArray(connections) ? connections : [];
  }

  /**
   * 获取服务凭据列表
   */
  async listServiceCredentials(
    params: ListServiceCredentialsRequest = {}
  ): Promise<ServiceCredential[]> {
    const queryParams = new URLSearchParams();
    if (params.serviceCredentialType) {
      queryParams.set('serviceCredentialType', params.serviceCredentialType);
    }

    const queryString = queryParams.toString();
    const endpoint = `/organizations/${this.config.organizationId}/serviceCredentials${queryString ? '?' + queryString : ''}`;
    const credentials = await this.flowRequest<ServiceCredential[]>(endpoint, { method: 'GET' });

    return Array.isArray(credentials) ? credentials : [];
  }

  // ============ 流水线相关 API ============

  /**
   * 获取流水线列表
   */
  async listPipelines(params: ListPipelinesRequest = {}): Promise<{
    data: Pipeline[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.pipelineName) queryParams.set('pipelineName', params.pipelineName);
    if (params.statusList) queryParams.set('statusList', params.statusList);
    if (params.createStartTime)
      queryParams.set('createStartTime', params.createStartTime.toString());
    if (params.createEndTime) queryParams.set('createEndTime', params.createEndTime.toString());
    if (params.executeStartTime)
      queryParams.set('executeStartTime', params.executeStartTime.toString());
    if (params.executeEndTime) queryParams.set('executeEndTime', params.executeEndTime.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.perPage) queryParams.set('perPage', params.perPage.toString());

    const queryString = queryParams.toString();
    const endpoint = `/organizations/${this.config.organizationId}/pipelines${queryString ? '?' + queryString : ''}`;

    const response = await this.flowRequestRaw(endpoint, { method: 'GET' });
    const pipelines = await response.json();
    const pagination = this.extractPagination(response);

    return {
      data: Array.isArray(pipelines) ? pipelines : [],
      pagination,
    };
  }

  /**
   * 获取流水线详情
   */
  async getPipeline(pipelineId: string): Promise<PipelineDetail> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}`;
    return this.flowRequest<PipelineDetail>(endpoint, { method: 'GET' });
  }

  /**
   * 创建流水线
   */
  async createPipeline(data: CreatePipelineRequest): Promise<number> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines`;
    return this.flowRequest<number>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 更新流水线
   */
  async updatePipeline(pipelineId: string, data: UpdatePipelineRequest): Promise<boolean> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}`;
    return this.flowRequest<boolean>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 获取流水线任务的执行历史
   */
  async listPipelineJobHistorys(params: ListPipelineJobHistorysRequest): Promise<{
    data: PipelineJobHistory[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('pipelineId', params.pipelineId);
    queryParams.set('category', params.category);
    queryParams.set('identifier', params.identifier);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.perPage) queryParams.set('perPage', params.perPage.toString());

    const endpoint = `/organizations/${this.config.organizationId}/pipelines/getComponentsWithoutButtons?${queryParams.toString()}`;

    const response = await this.flowRequestRaw(endpoint, { method: 'GET' });
    const histories = await response.json();
    const pagination = this.extractPagination(response);

    return {
      data: Array.isArray(histories) ? histories : [],
      pagination,
    };
  }

  // ============ 流水线运行实例相关 API ============

  /**
   * 运行流水线（创建运行实例）
   */
  async createPipelineRun(pipelineId: string, params?: CreatePipelineRunRequest): Promise<number> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}/runs`;
    return this.flowRequest<number>(endpoint, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  /**
   * 获取流水线运行实例详情
   */
  async getPipelineRun(pipelineId: string, pipelineRunId: string): Promise<PipelineRunDetail> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}/runs/${pipelineRunId}`;
    return this.flowRequest<PipelineRunDetail>(endpoint, { method: 'GET' });
  }

  /**
   * 获取最近一次流水线运行信息
   */
  async getLatestPipelineRun(pipelineId: string): Promise<PipelineRunDetail> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}/runs/latestPipelineRun`;
    return this.flowRequest<PipelineRunDetail>(endpoint, { method: 'GET' });
  }

  /**
   * 手动运行流水线任务
   */
  async executePipelineJobRun(
    pipelineId: string,
    pipelineRunId: string,
    jobId: string
  ): Promise<boolean> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}/pipelineRuns/${pipelineRunId}/jobs/${jobId}/start`;
    return this.flowRequest<boolean>(endpoint, { method: 'POST' });
  }

  /**
   * 查询流水线任务运行日志
   */
  async getPipelineJobRunLog(
    pipelineId: string,
    pipelineRunId: string,
    jobId: string
  ): Promise<PipelineJobRunLog> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${pipelineId}/runs/${pipelineRunId}/job/${jobId}/log`;
    return this.flowRequest<PipelineJobRunLog>(endpoint, { method: 'GET' });
  }

  /**
   * 获取流水线运行实例列表
   */
  async listPipelineRuns(params: ListPipelineRunsRequest): Promise<{
    data: PipelineRun[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.perPage) queryParams.set('perPage', params.perPage.toString());
    if (params.startTime) queryParams.set('startTime', params.startTime.toString());
    if (params.endTme) queryParams.set('endTme', params.endTme.toString()); // API typo: endTme
    if (params.status) queryParams.set('status', params.status);
    if (params.triggerMode) queryParams.set('triggerMode', params.triggerMode.toString());

    const queryString = queryParams.toString();
    const endpoint = `/organizations/${this.config.organizationId}/pipelines/${params.pipelineId}/runs${queryString ? '?' + queryString : ''}`;

    const response = await this.flowRequestRaw(endpoint, { method: 'GET' });
    const runs = await response.json();
    const pagination = this.extractPagination(response);

    return {
      data: Array.isArray(runs) ? runs : [],
      pagination,
    };
  }

  // ============ 流水线分组相关 API ============

  /**
   * 获取流水线分组详情
   */
  async getPipelineGroup(groupId: string): Promise<PipelineGroup> {
    const endpoint = `/organizations/${this.config.organizationId}/pipelineGroups/${groupId}`;
    return this.flowRequest<PipelineGroup>(endpoint, { method: 'GET' });
  }

  /**
   * 获取流水线分组列表
   */
  async listPipelineGroups(params: ListPipelineGroupsRequest = {}): Promise<{
    data: PipelineGroup[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.perPage) queryParams.set('perPage', params.perPage.toString());

    const queryString = queryParams.toString();
    const endpoint = `/organizations/${this.config.organizationId}/pipelineGroups${queryString ? '?' + queryString : ''}`;

    const response = await this.flowRequestRaw(endpoint, { method: 'GET' });
    const groups = await response.json();
    const pagination = this.extractPagination(response);

    return {
      data: Array.isArray(groups) ? groups : [],
      pagination,
    };
  }

  /**
   * 获取流水线分组下的流水线列表
   */
  async listPipelineGroupPipelines(params: ListPipelineGroupPipelinesRequest): Promise<{
    data: PipelineGroupPipeline[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('groupId', params.groupId.toString());
    if (params.pipelineName) queryParams.set('pipelineName', params.pipelineName);
    if (params.statusList) queryParams.set('statusList', params.statusList);
    if (params.createStartTime)
      queryParams.set('createStartTime', params.createStartTime.toString());
    if (params.createEndTime) queryParams.set('createEndTime', params.createEndTime.toString());
    if (params.executeStartTime)
      queryParams.set('executeStartTime', params.executeStartTime.toString());
    if (params.executeEndTime) queryParams.set('executeEndTime', params.executeEndTime.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.perPage) queryParams.set('perPage', params.perPage.toString());

    const endpoint = `/organizations/${this.config.organizationId}/pipelineGroups/pipelines?${queryParams.toString()}`;

    const response = await this.flowRequestRaw(endpoint, { method: 'GET' });
    const pipelines = await response.json();
    const pagination = this.extractPagination(response);

    return {
      data: Array.isArray(pipelines) ? pipelines : [],
      pagination,
    };
  }

  /**
   * 将流水线加入流水线分组
   */
  async addToPipelineGroup(params: AddToPipelineGroupRequest): Promise<boolean> {
    const queryParams = new URLSearchParams();
    queryParams.set('pipelineIds', params.pipelineIds);
    queryParams.set('groupId', params.groupId.toString());

    const endpoint = `/organizations/${this.config.organizationId}/pipelineGroups/join?${queryParams.toString()}`;
    return this.flowRequest<boolean>(endpoint, { method: 'POST' });
  }
}

/**
 * 创建默认的 Yunxiao API 客户端实例
 */
export function createYunxiaoClient(): YunxiaoApiClient {
  const config: YunxiaoConfig = {
    organizationId: process.env.YUNXIAO_ORGANIZATION_ID!,
    accessToken: process.env.YUNXIAO_ACCESS_TOKEN!,
    baseURL: process.env.YUNXIAO_API_BASE_URL!,
  };

  // 验证必要的配置
  if (!config.organizationId || !config.accessToken || !config.baseURL) {
    throw new Error(
      'Missing required Yunxiao configuration. Please check your environment variables.'
    );
  }

  return new YunxiaoApiClient(config);
}
