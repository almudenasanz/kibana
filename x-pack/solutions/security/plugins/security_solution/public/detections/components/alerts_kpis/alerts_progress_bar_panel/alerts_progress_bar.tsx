/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiLink,
  EuiPopover,
  EuiPopoverTitle,
  EuiProgress,
  EuiSpacer,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { TableId } from '@kbn/securitysolution-data-table';
import type { AlertsProgressBarData, GroupBySelection } from './types';
import type { AddFilterProps } from '../common/types';
import { getAggregateData } from './helpers';
import { DefaultDraggable } from '../../../../common/components/draggables';
import * as i18n from './translations';

const ProgressWrapper = styled.div`
  height: 160px;
`;

const StyledEuiHorizontalRule = styled(EuiHorizontalRule)`
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.eui.euiSizeS};
`;

const StyledEuiFlexGroup = styled(EuiFlexGroup)`
  margin-top: -${({ theme }) => theme.eui.euiSizeM};
`;

const StyledEuiProgress = styled(EuiProgress)`
  margin-bottom: ${({ theme }) => theme.eui.euiSizeS};
`;

const DataStatsWrapper = styled.div`
  width: 250px;
`;

export interface AlertsProcessBarProps {
  data: AlertsProgressBarData[];
  isLoading: boolean;
  addFilter?: ({ field, value, negate }: AddFilterProps) => void;
  groupBySelection: GroupBySelection;
}

export const AlertsProgressBar: React.FC<AlertsProcessBarProps> = ({
  data,
  isLoading,
  addFilter,
  groupBySelection,
}) => {
  const { euiTheme } = useEuiTheme();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = () => setIsPopoverOpen(!isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const [nonEmpty, formattedNonEmptyPercent] = getAggregateData(data);

  const dataStatsButton = (
    <EuiButtonIcon
      color="text"
      iconType="iInCircle"
      aria-label="info"
      size="xs"
      onClick={onButtonClick}
    />
  );

  const dataStatsMessage = (
    <DataStatsWrapper>
      <EuiPopoverTitle>{i18n.DATA_STATISTICS_TITLE(formattedNonEmptyPercent)}</EuiPopoverTitle>
      <EuiText size="s">
        {i18n.DATA_STATISTICS_MESSAGE(groupBySelection)}
        <EuiLink
          color="primary"
          onClick={() => {
            setIsPopoverOpen(false);
            if (addFilter) {
              addFilter({ field: groupBySelection, value: null, negate: true });
            }
          }}
        >
          {i18n.NON_EMPTY_FILTER(groupBySelection)}
        </EuiLink>
      </EuiText>
    </DataStatsWrapper>
  );

  const labelWithHoverActions = (key: string) => {
    return (
      <DefaultDraggable
        field={groupBySelection}
        hideTopN={true}
        id={`top-alerts-${key}`}
        value={key}
        queryValue={key}
        tooltipContent={null}
        scopeId={TableId.alertsOnAlertsPage}
      >
        <EuiText size="xs" className="eui-textTruncate">
          {key}
        </EuiText>
      </DefaultDraggable>
    );
  };

  const color = useMemo(
    () =>
      euiTheme.themeName === 'EUI_THEME_BOREALIS'
        ? euiTheme.colors.vis.euiColorVis6
        : euiTheme.colors.vis.euiColorVis9,
    [euiTheme]
  );

  return (
    <>
      <StyledEuiFlexGroup alignItems="center" gutterSize="xs">
        <EuiFlexItem grow={false}>
          <EuiText size="s" data-test-subj="alerts-progress-bar-title">
            <h5>{groupBySelection}</h5>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover
            button={dataStatsButton}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            anchorPosition="rightCenter"
            panelPaddingSize="s"
          >
            {dataStatsMessage}
          </EuiPopover>
        </EuiFlexItem>
      </StyledEuiFlexGroup>
      {isLoading ? (
        <StyledEuiProgress size="xs" color="primary" />
      ) : (
        <>
          <StyledEuiHorizontalRule />
          <ProgressWrapper data-test-subj="progress-bar" className="eui-yScroll">
            {nonEmpty === 0 ? (
              <>
                <EuiText size="s" textAlign="center" data-test-subj="empty-proress-bar">
                  {i18n.EMPTY_DATA_MESSAGE}
                </EuiText>
                <EuiSpacer size="l" />
              </>
            ) : (
              <>
                {data.map(
                  (item) =>
                    item.key !== '-' && (
                      <div key={`${item.key}`} data-test-subj={`progress-bar-${item.key}`}>
                        <EuiProgress
                          valueText={
                            <EuiText size="xs" color="default">
                              <strong>{item.percentageLabel}</strong>
                            </EuiText>
                          }
                          max={1}
                          color={color}
                          size="s"
                          value={item.percentage}
                          label={
                            item.key === 'Other' ? item.label : labelWithHoverActions(item.key)
                          }
                        />
                        <EuiSpacer size="s" />
                      </div>
                    )
                )}
              </>
            )}
            <EuiSpacer size="s" />
          </ProgressWrapper>
        </>
      )}
    </>
  );
};

AlertsProgressBar.displayName = 'AlertsProgressBar';
