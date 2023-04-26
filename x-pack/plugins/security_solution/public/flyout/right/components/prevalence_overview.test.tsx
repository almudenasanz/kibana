/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ExpandableFlyoutContext } from '@kbn/expandable-flyout/src/context';
import { RightPanelContext } from '../context';
import { INSIGHTS_CORRELATIONS_VIEW_ALL_BUTTON_TEST_ID } from './test_ids';
import { TestProviders } from '../../../common/mock';
import { LeftPanelInsightsTabPath, LeftPanelKey } from '../../left';
import { PrevalenceOverview } from './prevalence_overview';

const panelContextValue = {} as unknown as RightPanelContext;

const renderPrevalenceOverview = (contextValue: RightPanelContext) => (
  <TestProviders>
    <RightPanelContext.Provider value={contextValue}>
      <PrevalenceOverview />
    </RightPanelContext.Provider>
  </TestProviders>
);

describe('<ThreatIntelligenceOverview />', () => {
  it('should', () => {
    const { getByTestId } = render(renderPrevalenceOverview(panelContextValue));
  });

  it('should navigate to the left section Insights tab when clicking on button', () => {
    const flyoutContextValue = {
      openLeftPanel: jest.fn(),
    } as unknown as ExpandableFlyoutContext;

    const { getByTestId } = render(
      <TestProviders>
        <ExpandableFlyoutContext.Provider value={flyoutContextValue}>
          <RightPanelContext.Provider value={panelContextValue}>
            <PrevalenceOverview />
          </RightPanelContext.Provider>
        </ExpandableFlyoutContext.Provider>
      </TestProviders>
    );

    getByTestId(INSIGHTS_CORRELATIONS_VIEW_ALL_BUTTON_TEST_ID).click();
    expect(flyoutContextValue.openLeftPanel).toHaveBeenCalledWith({
      id: LeftPanelKey,
      path: LeftPanelInsightsTabPath,
      params: {
        id: panelContextValue.eventId,
        indexName: panelContextValue.indexName,
      },
    });
  });
});
