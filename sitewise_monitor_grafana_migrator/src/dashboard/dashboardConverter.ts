import { DescribeDashboardResponse } from '@aws-sdk/client-iotsitewise';
import { MonitorWidget, MonitorWidgetType, SiteWiseMonitorDashboardDefinition } from './monitorTypes';

export class DashboardConverter {
  private parsingErrors: Error[] = [];

  constructor() {}

  public toGrafanaDashboardJSON = ({
    dashboard,
    datasourceUid,
  }: {
    dashboard: DescribeDashboardResponse;
    datasourceUid: string;
  }) => {
    const monitorDashboard = this.parseDashboardDefinition({
      monitorDashboardDefinition: dashboard.dashboardDefinition,
      dashboardName: dashboard.dashboardName,
    });
  };

  private parseDashboardDefinition({
    monitorDashboardDefinition,
    dashboardName,
  }: {
    monitorDashboardDefinition?: string;
    dashboardName?: string;
  }): SiteWiseMonitorDashboardDefinition {
    if (monitorDashboardDefinition) {
      try {
        return JSON.parse(monitorDashboardDefinition) as SiteWiseMonitorDashboardDefinition;
      } catch (error) {
        // Catch any parsing errors so we can return them at the end
        this.parsingErrors.push(new Error(`Dashboard ${dashboardName}: ${error.message}`));
      }
    }
    return { widgets: [] };
  }

  public flushErrors = () => {};
}
