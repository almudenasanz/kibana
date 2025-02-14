/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useCallback } from 'react';

import { useParams, useRouteMatch } from 'react-router-dom';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { useKibanaSpace } from '../../../../hooks/use_kibana_space';
import { useGetUrlParams } from '../../hooks';
import {
  MONITOR_ALERTS_ROUTE,
  MONITOR_ERRORS_ROUTE,
  MONITOR_HISTORY_ROUTE,
} from '../../../../../common/constants';
import { ClientPluginsStart } from '../../../../plugin';
import { PLUGIN } from '../../../../../common/constants/plugin';
import { useSelectedLocation } from './hooks/use_selected_location';
import { MonitorLocationSelect } from '../common/components/monitor_location_select';
import { useSelectedMonitor } from './hooks/use_selected_monitor';

export const MonitorDetailsLocation = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { monitor } = useSelectedMonitor();
  const { monitorId } = useParams<{ monitorId: string }>();

  const { dateRangeStart, dateRangeEnd } = useGetUrlParams();

  const selectedLocation = useSelectedLocation();

  const { services } = useKibana<ClientPluginsStart>();

  const isErrorsTab = useRouteMatch(MONITOR_ERRORS_ROUTE);
  const isHistoryTab = useRouteMatch(MONITOR_HISTORY_ROUTE);
  const isAlertsTab = useRouteMatch(MONITOR_ALERTS_ROUTE);

  const { space } = useKibanaSpace();
  const { spaceId } = useGetUrlParams();

  let params = `&dateRangeStart=${dateRangeStart}&dateRangeEnd=${dateRangeEnd}`;

  if (spaceId && spaceId !== space?.id) {
    params += `&spaceId=${spaceId}`;
  }

  return (
    <MonitorLocationSelect
      isDisabled={isDisabled}
      monitorLocations={monitor?.locations}
      configId={monitorId}
      selectedLocation={selectedLocation}
      onChange={useCallback(
        (id, label) => {
          if (isAlertsTab) {
            services.application.navigateToApp(PLUGIN.SYNTHETICS_PLUGIN_ID, {
              path: `/monitor/${monitorId}/alerts?locationId=${id}${params}`,
            });
          } else if (isErrorsTab) {
            services.application.navigateToApp(PLUGIN.SYNTHETICS_PLUGIN_ID, {
              path: `/monitor/${monitorId}/errors?locationId=${id}${params}`,
            });
          } else if (isHistoryTab) {
            services.application.navigateToApp(PLUGIN.SYNTHETICS_PLUGIN_ID, {
              path: `/monitor/${monitorId}/history/?locationId=${id}${params}`,
            });
          } else {
            services.application.navigateToApp(PLUGIN.SYNTHETICS_PLUGIN_ID, {
              path: `/monitor/${monitorId}?locationId=${id}${params}`,
            });
          }
        },
        [isAlertsTab, isErrorsTab, isHistoryTab, monitorId, params, services.application]
      )}
    />
  );
};
