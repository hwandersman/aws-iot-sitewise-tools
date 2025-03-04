export enum GrafanaPanelType {
  TimeSeries = 'timeseries',
  BarChart = 'barchart',
  Stat = 'stat',
  Table = 'table',
  StateTimeline = 'state-timeline',
}

export interface GrafanaDatasource {
  type: string;
  uid: string;
}

export interface GrafanaPanelThresholdStep {
  color?: string;
  value?: number;
}

export interface GrafanaFieldConfig {
  defaults: {
    color?: {
      mode?: string;
    };
    custom?: {
      axisSoftMax?: number;
      axisSoftMin?: number;
      gradientMode?: string;
      thresholdStyle?: {
        mode?: string;
      };
      drawStyle?: string;
    };
    thresholds?: {
      mode?: string;
      steps?: GrafanaPanelThresholdStep[];
    };
  };
}

export interface GrafanaPanelPosition {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface GrafanaPanelOptions {
  colorMode?: string;
  textMode?: string;
  wideLayout?: boolean;
}

export enum GrafanaSiteWiseQueryType {
  PropertyAggregate = 'PropertyAggregate',
  PropertyInterpolated = 'PropertyInterpolated',
  PropertyValueHistory = 'PropertyValueHistory',
  PropertyValue = 'PropertyValue',
}

export enum GrafanaQueryAggregates {
  Average = 'Average',
  Count = 'Count',
  Min = 'Min',
  Max = 'Max',
  Sum = 'Sum',
  Stddev = 'Stddev',
}

export enum GrafanaQueryResolution {
  Auto = 'AUTO',
  Second = '1s',
  TenSeconds = '10s',
  Minute = '1m',
  TenMinutes = '10m',
  Hour = '1h',
  TenHours = '10h',
  Day = '1d',
}

export enum GrafanaQueryResponseFormat {
  TimeSeries = 'timeseries',
  Table = 'table',
}

export interface GrafanaPanelQuery {
  refId: string;
  queryType: GrafanaSiteWiseQueryType;
  assetIds?: string[];
  propertyId?: string;
  propertyAlias?: string; // SiteWise Monitor doesn't support this, but Grafana does
  aggregates?: GrafanaQueryAggregates;
  resolution?: GrafanaQueryResolution;
  responseFormat?: GrafanaQueryResponseFormat;
  datasource?: GrafanaDatasource;
}

export interface GrafanaPanel {
  datasource?: GrafanaDatasource;
  fieldConfig?: GrafanaFieldConfig;
  gridPos?: GrafanaPanelPosition;
  id?: number;
  options?: GrafanaPanelOptions;
  targets?: GrafanaPanelQuery[];
  title?: string;
  type?: GrafanaPanelType;
}

export interface GrafanaDashboardTimeRange {
  from: string;
  now: string;
}

export interface GrafanaDashboard {
  title: string;
  panels: GrafanaPanel[];
  time: GrafanaDashboardTimeRange;
}

export interface GrafanaDashboardDefinition {
  dashboard: GrafanaDashboard;
  folderUid: string;
  message?: string;
  overwrite?: boolean;
}
