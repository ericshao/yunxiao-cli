import { YunxiaoApiClient } from '../../src/lib/yunxiao-client';

const config = {
  organizationId: 'org-1',
  accessToken: 'token-1',
  baseURL: 'https://example.aliyun.com/oapi/v1/projex',
};

describe('YunxiaoApiClient pipeline job APIs', () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('starts a pipeline job run with the official pipelineRuns path', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('true', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const client = new YunxiaoApiClient(config);

    await expect(client.executePipelineJobRun('123', '456', '789')).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.aliyun.com/oapi/v1/flow/organizations/org-1/pipelines/123/pipelineRuns/456/jobs/789/start',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-yunxiao-token': 'token-1',
        }),
      })
    );
  });

  it('fetches a pipeline job run log with the official runs/job/log path', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ content: 'success', last: 1, more: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const client = new YunxiaoApiClient(config);

    await expect(client.getPipelineJobRunLog('123', '456', '789')).resolves.toEqual({
      content: 'success',
      last: 1,
      more: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.aliyun.com/oapi/v1/flow/organizations/org-1/pipelines/123/runs/456/job/789/log',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-yunxiao-token': 'token-1',
        }),
      })
    );
  });

  it('lists service connections with the official sericeConnectionType query parameter', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            ownerAccountId: 'owner-1',
            name: 'Codeup connection',
            id: 1,
            type: 'Codeup',
            createTime: 1614693258000,
            uuid: 'connection-uuid',
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );

    const client = new YunxiaoApiClient(config);

    await expect(
      client.listServiceConnections({ sericeConnectionType: 'codeup' })
    ).resolves.toEqual([
      {
        ownerAccountId: 'owner-1',
        name: 'Codeup connection',
        id: 1,
        type: 'Codeup',
        createTime: 1614693258000,
        uuid: 'connection-uuid',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.aliyun.com/oapi/v1/flow/organizations/org-1/serviceConnections?sericeConnectionType=codeup',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-yunxiao-token': 'token-1',
        }),
      })
    );
  });

  it('lists service credentials with the official serviceCredentialType query parameter', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: 46916,
            type: 'Codeup',
            ownerName: 'welogix',
            editable: false,
            ownerStaffId: 'staff-1',
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );

    const client = new YunxiaoApiClient(config);

    await expect(
      client.listServiceCredentials({ serviceCredentialType: 'Codeup' })
    ).resolves.toEqual([
      {
        id: 46916,
        type: 'Codeup',
        ownerName: 'welogix',
        editable: false,
        ownerStaffId: 'staff-1',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.aliyun.com/oapi/v1/flow/organizations/org-1/serviceCredentials?serviceCredentialType=Codeup',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-yunxiao-token': 'token-1',
        }),
      })
    );
  });

  it('adds pipelines to a pipeline group with the official join path', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('true', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const client = new YunxiaoApiClient(config);

    await expect(
      client.addToPipelineGroup({ groupId: 40164, pipelineIds: '123,456' })
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.aliyun.com/oapi/v1/flow/organizations/org-1/pipelineGroups/join?pipelineIds=123%2C456&groupId=40164',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-yunxiao-token': 'token-1',
        }),
      })
    );
  });
});
