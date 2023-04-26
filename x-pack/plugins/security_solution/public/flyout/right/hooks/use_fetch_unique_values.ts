/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQueryAlerts } from '../../../detections/containers/detection_engine/alerts/use_query';
import { ALERTS_QUERY_NAMES } from '../../../detections/containers/detection_engine/alerts/constants';
import type { AlertPrevalenceAggregation } from '../../../common/containers/alerts/use_alert_prevalence';
import { inputsSelectors } from '../../../common/store';
import { useDeepEqualSelector } from '../../../common/hooks/use_selector';
import { useGlobalTime } from '../../../common/containers/use_global_time';

export interface UseUniqueValuesParams {
  /**
   *
   */
  field: string;
  /**
   *
   */
  isActiveTimelines: boolean;
  /**
   *
   */
  indexName: string;
}

export interface UseUniqueValuesValue {
  /**
   *
   */
  loading: boolean;
  /**
   *
   */
  error: boolean;
  /**
   *
   */
  data: string[];
  /**
   *
   */
  count: number;
}

const ALERT_PREVALENCE_AGG = 'countOfAlertsWithSameField';

/**
 * Hook to retrieve threat intelligence data for the expandable flyout right and left sections.
 */
export const useFetchUniqueValues = ({
  field,
  isActiveTimelines,
  indexName,
}: UseUniqueValuesParams): UseUniqueValuesValue => {
  const timelineTime = useDeepEqualSelector((state) =>
    inputsSelectors.timelineTimeRangeSelector(state)
  );
  const globalTime = useGlobalTime();

  const { to, from } = isActiveTimelines ? timelineTime : globalTime;

  // const query = {
  //   bool: {
  //     must: {
  //       match: {
  //         [field]: field,
  //       },
  //       filter: [
  //         {
  //           range: {
  //             '@timestamp': {
  //               gte: from,
  //               lte: to,
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   },
  // };

  const query = {
    aggs: {
      [ALERT_PREVALENCE_AGG]: {
        terms: {
          field,
        },
      },
    },
  };

  const { loading, data, setQuery } = useQueryAlerts<{ _id: string }, AlertPrevalenceAggregation>({
    query,
    indexName,
    queryName: ALERTS_QUERY_NAMES.PREVALENCE,
  });

  let count: undefined | number;
  if (data) {
    count = data.aggregations?.[ALERT_PREVALENCE_AGG]?.buckets;
  }

  const error = !loading && count === undefined;
  const alertIds = data?.hits.hits.map(({ _id }) => _id);

  return {
    loading,
    error,
    data: alertIds || [],
    count: count || 0,
  };
};
