/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { VFC } from 'react';
import React from 'react';
import { useFetchHostWithFieldPair } from '../hooks/use_fetch_host_with_field_pair';
import { useFetchUniqueValues } from '../hooks/use_fetch_unique_values';
import { InsightsSummaryRow } from './insights_summary_row';
import { TimelineId } from '../../../../common/types';
import { useAlertPrevalence } from '../../../common/containers/alerts/use_alert_prevalence';

const PERCENTAGE_THRESHOLD = 0.1; // 10%

export interface PrevalenceOverviewRowProps {
  /**
   *
   */
  field: string;
  /**
   *
   */
  values: string[];
  /**
   *
   */
  indexName: string;
  /**
   *
   */
  scopeId: string;
  /**
   *  Prefix data-test-subj because this component will be used in multiple places
   */
  ['data-test-subj']?: string;
}

/**
 *
 */
export const PrevalenceOverviewRow: VFC<PrevalenceOverviewRowProps> = ({
  field,
  values,
  indexName,
  scopeId,
  'data-test-subj': dataTestSubj,
}) => {
  const isActiveTimelines = scopeId === TimelineId.active;

  // TODO create a new hook to retrieve hosts that have the field/value pair
  useFetchHostWithFieldPair();

  // and probably remove this one
  const {
    loading: prevalenceLoading,
    error: prevalenceError,
    count: prevalenceCount,
  } = useAlertPrevalence({
    field,
    isActiveTimelines,
    value: values,
    signalIndexName: null,
  });

  const {
    loading: uniqueValuesLoading,
    error: uniqueValuesError,
    count: uniqueValuesCount,
  } = useFetchUniqueValues({
    field,
    indexName,
    isActiveTimelines,
  });

  const prevalence = (prevalenceCount || 0) / uniqueValuesCount;

  if (prevalence === 0 || prevalence > PERCENTAGE_THRESHOLD) {
    return null;
  }

  const text = `${field}, ${values} is uncommon`;
  return (
    <InsightsSummaryRow
      loading={prevalenceLoading || uniqueValuesLoading}
      error={prevalenceError || uniqueValuesError}
      icon={'warning'}
      value={prevalence}
      text={text}
      data-test-subj={dataTestSubj}
    />
  );
};

PrevalenceOverviewRow.displayName = 'PrevalenceOverviewRow';
