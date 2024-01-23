/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/// <reference types="@kbn/ambient-ftr-types"/>


import expect from '@kbn/expect';
import { chatClient, kibanaClient, synthtraceEsClients } from '../../services';
import { apm_transaction_rate_AIAssistant, custom_threshold_AIAssistant_log_count } from '../../alert_templates';
import { MessageRole } from '../../../../common';

import { RuleResponse } from '@kbn/alerting-plugin/common/routes/rule/response/types/v1'

import moment from 'moment';
import { apm, timerange } from '@kbn/apm-synthtrace-client';


describe('alert function', () => {
  let rule_ids: any[] = []

  before(async () => {
    console.log("Creating APM rule")
    const responseApmRule = await kibanaClient.callKibana<RuleResponse>("post",
      { pathname: "/api/alerting/rule" },
      apm_transaction_rate_AIAssistant.ruleParams,
    );
    rule_ids.push(responseApmRule.data.id);

    console.log("Creating dataview")
    await kibanaClient.callKibana("post",
      { pathname: "/api/content_management/rpc/create" },
      custom_threshold_AIAssistant_log_count.dataViewParams,
    );

    console.log("Creating logs rule")
    const responseLogsRule = await kibanaClient.callKibana<RuleResponse>("post",
      { pathname: "/api/alerting/rule" },
      custom_threshold_AIAssistant_log_count.ruleParams,
    );
    rule_ids.push(responseLogsRule.data.id);

    await synthtraceEsClients.apmSynthtraceEsClient.clean();

    const myServiceInstance = apm
      .service('my-service', 'production', 'go')
      .instance('my-instance');

    await synthtraceEsClients.apmSynthtraceEsClient.index(
      timerange(moment().subtract(15, 'minutes'), moment())
        .interval('1m')
        .rate(10)
        .generator((timestamp) =>
          myServiceInstance
            .transaction('GET /api')
            .timestamp(timestamp)
            .duration(50)
            .failure()
            .errors(
              myServiceInstance.error({ message: "errorMessage", type: 'My Type' }).timestamp(timestamp)
            )
        ));

    await synthtraceEsClients.apmSynthtraceEsClient.index(
      timerange(moment().subtract(15, 'minutes'), moment())
        .interval('1m')
        .rate(10)
        .generator((timestamp) =>
          myServiceInstance
            .transaction('GET /api')
            .timestamp(timestamp)
            .duration(50)
            .outcome('success')
        ));

  });

  it('summary of active alerts', async () => {
    let conversation = await chatClient.complete(
      'Are there any active alerts?'
    );

    const result = await chatClient.evaluate(conversation, [
      'Uses alerts function to retrieve active alerts',
      'Responds with a summary of the current active alerts',
    ]);

    expect(result.passed).to.be(true);
  });

  it('filtered alerts', async () => {
    let conversation = await chatClient.complete(
      'Do I have any active alerts related to logs_synth?'
    );

    conversation = await chatClient.complete(
      conversation.conversationId!,
      conversation.messages.concat({
        content: 'Do I have any alerts on the service my-service?',
        role: MessageRole.User
      })
    );

    const result = await chatClient.evaluate(conversation, [
      'Uses alerts function to retrieve active alerts for logs_synth, uses "filter": "logs_synth" in the alert function, not service.name or tags',
      'Returns one or more alerts related to logs_synth, does not return no active alerts related to logs_synth',
      'Uses alerts function to filtering on service.name my-service to retrieve active alerts for that service',
      'Returns one or more alerts related to my-service',
    ]);

    expect(result.passed).to.be(true);
  });

  after(async () => {
    await synthtraceEsClients.apmSynthtraceEsClient.clean();

    for (let i in rule_ids) {
      await kibanaClient.callKibana("delete",
        { pathname: `/api/alerting/rule/${rule_ids[i]}` },
      )
    }

    await kibanaClient.callKibana("post",
      { pathname: `/api/content_management/rpc/delete` },
      {
        contentTypeId: 'index-pattern',
        id: custom_threshold_AIAssistant_log_count.dataViewParams.options.id,
        options: { force: true },
        version: 1,
      }
    )

  })
});
