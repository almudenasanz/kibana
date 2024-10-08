/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useSelector } from '@xstate/react';
import { useCallback, useMemo } from 'react';
import { orderBy } from 'lodash';
import { DegradedField } from '../../common/data_streams_stats';
import { SortDirection } from '../../common/types';
import {
  DEFAULT_DEGRADED_FIELD_SORT_DIRECTION,
  DEFAULT_DEGRADED_FIELD_SORT_FIELD,
} from '../../common/constants';
import { useKibanaContextForPlugin } from '../utils';
import { useDatasetQualityDetailsState } from './use_dataset_quality_details_state';

export type DegradedFieldSortField = keyof DegradedField;

export function useDegradedFields() {
  const { service } = useDatasetQualityDetailsState();
  const {
    services: { fieldFormats },
  } = useKibanaContextForPlugin();

  const degradedFields = useSelector(service, (state) => state.context.degradedFields) ?? {};
  const { data, table } = degradedFields;
  const { page, rowsPerPage, sort } = table;

  const totalItemCount = data?.length ?? 0;

  const pagination = {
    pageIndex: page,
    pageSize: rowsPerPage,
    totalItemCount,
    hidePerPageOptions: true,
  };

  const onTableChange = useCallback(
    (options: {
      page: { index: number; size: number };
      sort?: { field: DegradedFieldSortField; direction: SortDirection };
    }) => {
      service.send({
        type: 'UPDATE_DEGRADED_FIELDS_TABLE_CRITERIA',
        degraded_field_criteria: {
          page: options.page.index,
          rowsPerPage: options.page.size,
          sort: {
            field: options.sort?.field || DEFAULT_DEGRADED_FIELD_SORT_FIELD,
            direction: options.sort?.direction || DEFAULT_DEGRADED_FIELD_SORT_DIRECTION,
          },
        },
      });
    },
    [service]
  );

  const renderedItems = useMemo(() => {
    const sortedItems = orderBy(data, sort.field, sort.direction);
    return sortedItems.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [data, sort.field, sort.direction, page, rowsPerPage]);

  const isLoading = useSelector(service, (state) =>
    state.matches('initializing.dataStreamDegradedFields.fetching')
  );

  return {
    isLoading,
    pagination,
    onTableChange,
    renderedItems,
    sort: { sort },
    fieldFormats,
    totalItemCount,
  };
}
