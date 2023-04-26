/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { useCallback, useMemo } from 'react';
import { EuiButtonEmpty, EuiFlexGroup, EuiPanel } from '@elastic/eui';
import { useExpandableFlyoutContext } from '@kbn/expandable-flyout';
import { PrevalenceOverviewRow } from './prevalence_overview_row';
import { getSummaryRows } from '../../../common/components/event_details/get_alert_summary_rows';
import { INSIGHTS_PREVALENCE_TEST_ID } from './test_ids';
import { InsightsSubSection } from './insights_subsection';
import { useRightPanelContext } from '../context';
import { PREVALENCE_TEXT, PREVALENCE_TITLE, VIEW_ALL } from './translations';
import { LeftPanelKey, LeftPanelInsightsTabPath } from '../../left';

/**
 * Prevalence section under Insights section, overview tab.
 * The component fetches the necessary data, then pass it down to the InsightsSubSection component for loading and error state,
 * and the SummaryPanel component for data rendering.
 */
export const PrevalenceOverview: FC = () => {
  const { eventId, indexName, browserFields, dataFormattedForFieldBrowser, scopeId } =
    useRightPanelContext();
  const { openLeftPanel } = useExpandableFlyoutContext();

  const goToCorrelationsTab = useCallback(() => {
    openLeftPanel({
      id: LeftPanelKey,
      path: LeftPanelInsightsTabPath,
      params: {
        id: eventId,
        indexName,
      },
    });
  }, [eventId, openLeftPanel, indexName]);

  const summaryRows = useMemo(
    () =>
      getSummaryRows({
        browserFields,
        data: dataFormattedForFieldBrowser,
        eventId,
        scopeId,
        isReadOnly: false,
      }),
    [browserFields, dataFormattedForFieldBrowser, eventId, scopeId]
  );

  if (!eventId || !browserFields || !dataFormattedForFieldBrowser || summaryRows.length === 0) {
    return null;
  }

  return (
    <InsightsSubSection title={PREVALENCE_TITLE} data-test-subj={INSIGHTS_PREVALENCE_TEST_ID}>
      <EuiPanel hasShadow={false} hasBorder={true} paddingSize="s">
        <EuiFlexGroup direction="column" gutterSize="none">
          {/* {summaryRows.map((row) => (*/}
          {/*  <PrevalenceOverviewRow*/}
          {/*    field={row.description.data.field}*/}
          {/*    values={row.description.values || []}*/}
          {/*    indexName={indexName}*/}
          {/*    scopeId={scopeId}*/}
          {/*    data-test-subj={INSIGHTS_PREVALENCE_TEST_ID}*/}
          {/*  />*/}
          {/* ))}*/}
          (
          <PrevalenceOverviewRow
            field={summaryRows[0].description.data.field}
            values={summaryRows[0].description.values || []}
            indexName={indexName}
            scopeId={scopeId}
            data-test-subj={INSIGHTS_PREVALENCE_TEST_ID}
          />
        </EuiFlexGroup>
      </EuiPanel>
      <EuiButtonEmpty
        onClick={goToCorrelationsTab}
        iconType="arrowStart"
        iconSide="left"
        size="s"
        data-test-subj={`${INSIGHTS_PREVALENCE_TEST_ID}ViewAllButton`}
      >
        {VIEW_ALL(PREVALENCE_TEXT)}
      </EuiButtonEmpty>
    </InsightsSubSection>
  );
};

PrevalenceOverview.displayName = 'PrevalenceOverview';
