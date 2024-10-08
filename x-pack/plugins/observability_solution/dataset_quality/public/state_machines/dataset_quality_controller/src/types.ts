/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DoneInvokeEvent } from 'xstate';
import { QualityIndicators, TableCriteria, TimeRangeConfig } from '../../../../common/types';
import {
  Dashboard,
  DatasetUserPrivileges,
  NonAggregatableDatasets,
} from '../../../../common/api_types';
import { Integration } from '../../../../common/data_streams_stats/integration';
import { DatasetTableSortField, DegradedFieldSortField } from '../../../hooks';
import { DegradedDocsStat } from '../../../../common/data_streams_stats/malformed_docs_stat';
import {
  DataStreamDegradedDocsStatServiceResponse,
  DataStreamSettings,
  DataStreamDetails,
  DataStreamStatServiceResponse,
  DataStreamStat,
  DataStreamStatType,
  DegradedField,
  DegradedFieldResponse,
} from '../../../../common/data_streams_stats';

export type FlyoutDataset = Omit<
  DataStreamStat,
  'type' | 'size' | 'sizeBytes' | 'lastActivity' | 'degradedDocs'
> & { type: string };

export interface DegradedFields {
  table: TableCriteria<DegradedFieldSortField>;
  data?: DegradedField[];
}

interface FiltersCriteria {
  inactive: boolean;
  fullNames: boolean;
  timeRange: TimeRangeConfig;
  integrations: string[];
  namespaces: string[];
  qualities: QualityIndicators[];
  query?: string;
}

export interface DataStreamIntegrations {
  integrationDetails?: Integration;
  dashboards?: Dashboard[];
}

export interface WithTableOptions {
  table: TableCriteria<DatasetTableSortField>;
}

export interface WithFlyoutOptions {
  flyout: {
    dataset?: FlyoutDataset;
    dataStreamSettings?: DataStreamSettings;
    datasetDetails?: DataStreamDetails;
    insightsTimeRange?: TimeRangeConfig;
    breakdownField?: string;
    degradedFields: DegradedFields;
    isNonAggregatable?: boolean;
    integration?: DataStreamIntegrations;
    isBreakdownFieldEcs: boolean | null;
  };
}

export interface WithFilters {
  filters: FiltersCriteria;
}

export interface WithDataStreamStats {
  datasetUserPrivileges: DatasetUserPrivileges;
  dataStreamStats: DataStreamStatType[];
}

export interface WithDegradedDocs {
  degradedDocStats: DegradedDocsStat[];
}

export interface WithNonAggregatableDatasets {
  nonAggregatableDatasets: string[];
}

export interface WithDatasets {
  datasets: DataStreamStat[];
  isSizeStatsAvailable: boolean;
}

export interface WithIntegrations {
  integrations: Integration[];
}

export type DefaultDatasetQualityControllerState = { type: string } & WithTableOptions &
  WithDataStreamStats &
  Partial<WithDegradedDocs> &
  WithFlyoutOptions &
  WithDatasets &
  WithFilters &
  WithNonAggregatableDatasets &
  Partial<WithIntegrations>;

type DefaultDatasetQualityStateContext = DefaultDatasetQualityControllerState &
  Partial<WithFlyoutOptions>;

export type DatasetQualityControllerTypeState =
  | {
      value: 'datasets.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'datasets.loaded';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'datasets.loaded.idle';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'degradedDocs.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'integrations.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'nonAggregatableDatasets.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamSettings.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamSettings.initializeIntegrations.integrationDashboards.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamSettings.initializeIntegrations.integrationDashboards.unauthorized';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamSettings.initializeIntegrations.integrationDetails.done';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamDetails.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamDetails.done';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.assertBreakdownFieldIsEcs.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.assertBreakdownFieldIsEcs.done';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value: 'flyout.initializing.dataStreamDegradedFields.fetching';
      context: DefaultDatasetQualityStateContext;
    }
  | {
      value:
        | 'flyout.initializing.integrationDashboards.fetching'
        | 'flyout.initializing.integrationDashboards.unauthorized';
      context: DefaultDatasetQualityStateContext;
    };

export type DatasetQualityControllerContext = DatasetQualityControllerTypeState['context'];

export type DatasetQualityControllerEvent =
  | {
      type: 'UPDATE_TABLE_CRITERIA';
      dataset_criteria: TableCriteria<DatasetTableSortField>;
    }
  | {
      type: 'UPDATE_DEGRADED_FIELDS_TABLE_CRITERIA';
      degraded_field_criteria: TableCriteria<DegradedFieldSortField>;
    }
  | {
      type: 'OPEN_FLYOUT';
      dataset: FlyoutDataset;
    }
  | {
      type: 'SELECT_NEW_DATASET';
      dataset: FlyoutDataset;
    }
  | {
      type: 'UPDATE_INSIGHTS_TIME_RANGE';
      timeRange: TimeRangeConfig;
    }
  | {
      type: 'BREAKDOWN_FIELD_CHANGE';
      breakdownField: string | null;
    }
  | {
      type: 'CLOSE_FLYOUT';
    }
  | {
      type: 'TOGGLE_INACTIVE_DATASETS';
    }
  | {
      type: 'TOGGLE_FULL_DATASET_NAMES';
    }
  | {
      type: 'UPDATE_TIME_RANGE';
      timeRange: TimeRangeConfig;
    }
  | {
      type: 'REFRESH_DATA';
    }
  | {
      type: 'UPDATE_INTEGRATIONS';
      integrations: string[];
    }
  | {
      type: 'UPDATE_NAMESPACES';
      namespaces: string[];
    }
  | {
      type: 'UPDATE_QUALITIES';
      qualities: QualityIndicators[];
    }
  | {
      type: 'UPDATE_QUERY';
      query: string;
    }
  | DoneInvokeEvent<DataStreamDegradedDocsStatServiceResponse>
  | DoneInvokeEvent<NonAggregatableDatasets>
  | DoneInvokeEvent<Dashboard[]>
  | DoneInvokeEvent<DataStreamDetails>
  | DoneInvokeEvent<DegradedFieldResponse>
  | DoneInvokeEvent<DataStreamSettings>
  | DoneInvokeEvent<DataStreamStatServiceResponse>
  | DoneInvokeEvent<Integration>
  | DoneInvokeEvent<boolean | null>
  | DoneInvokeEvent<Error>;
