import { summarizePipelineRun } from '../../src/formatters/pipeline-run-summary';
import { PipelineRunDetail } from '../../src/types/yunxiao';

describe('pipeline run summary', () => {
  it('keeps the useful status fields and drops verbose job payloads', () => {
    const run: PipelineRunDetail = {
      pipelineId: 2245888,
      pipelineRunId: 587,
      status: 'SUCCESS',
      triggerMode: 3,
      pipelineType: null as unknown as string,
      creatorAccountId: 'creator-account',
      modifierAccountId: 'modifier-account',
      createTime: 1781661511000,
      updateTime: 1781661718000,
      globalParams: [
        { key: 'CI_COMMIT_REF_NAME', value: 'staging', encrypted: false },
        { key: 'CI_COMMIT_ID', value: 'aabb094c', encrypted: false },
        { key: 'CI_COMMIT_SHA', value: 'aabb094c4b9d9e578c46a8867bb78fae398f67aa', encrypted: false },
        {
          key: 'CI_COMMIT_TITLE',
          value: 'Merge remote-tracking branch origin/dev into staging',
          encrypted: false,
        },
      ],
      groups: [],
      sources: [
        {
          sign: 'c2app-tcs-mw_FarA',
          type: 'codeup',
          name: 'c2tcs-backend_staging',
          data: {
            branch: 'staging',
            repo: 'https://codeup.aliyun.com/example.git',
            label: 'c2cloud/c2app-tcs-mw',
            isTrigger: true,
            webhook: 'https://example.invalid/secret-webhook',
          },
        },
      ],
      stageGroup: [],
      stages: [
        {
          index: 'Group0-Stage0',
          name: '构建',
          stageInfo: {
            name: '构建',
            status: 'SUCCESS',
            startTime: 1781661512000,
            endTime: 1781661647000,
            jobs: [
              {
                id: 452861429,
                name: 'NPM构建及镜像构建上传',
                jobSign: '19_1654764463655',
                status: 'SUCCESS',
                startTime: 1781661512000,
                endTime: 1781661647000,
                params: '{"noisy":"large"}',
                result: '{"artifact":"large"}',
                actions: [
                  {
                    name: '构建日志',
                    title: '日志',
                    type: 'LogPipelineJobRun',
                    displayType: 'LOG',
                    disable: false,
                    order: 90,
                    data: 'raw log link',
                    params: {},
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const summary = summarizePipelineRun(run);

    expect(summary).toMatchObject({
      pipelineId: 2245888,
      pipelineRunId: 587,
      status: 'SUCCESS',
      triggerModeName: '代码提交',
      ref: 'staging',
      commitId: 'aabb094c',
      durationSeconds: 207,
      source: {
        repo: 'https://codeup.aliyun.com/example.git',
        branch: 'staging',
      },
      stages: [
        {
          name: '构建',
          status: 'SUCCESS',
          durationSeconds: 135,
          jobs: [
            {
              name: 'NPM构建及镜像构建上传',
              status: 'SUCCESS',
              durationSeconds: 135,
            },
          ],
        },
      ],
    });
    expect(JSON.stringify(summary)).not.toContain('secret-webhook');
    expect(JSON.stringify(summary)).not.toContain('noisy');
    expect(JSON.stringify(summary)).not.toContain('raw log link');
  });
});
