import { SITEWISE_PLUGIN_ID } from '../clients/grafana/client';
import {
  GrafanaDatasource,
  GrafanaFieldConfig,
  GrafanaPanel,
  GrafanaPanelOptions,
  GrafanaPanelPosition,
  GrafanaPanelQuery,
  GrafanaPanelThresholdStep,
  GrafanaPanelType,
  GrafanaSiteWiseQueryType,
} from './grafanaTypes';
import { MonitorAnnotation, MonitorWidget, MonitorWidgetType } from './monitorTypes';

export const toGrafanaDashboardPanel = ({
  monitorWidget,
  panelId,
  datasourceUid,
}: {
  monitorWidget: MonitorWidget;
  panelId: number;
  datasourceUid: string;
}): GrafanaPanel => {
  const datasource: GrafanaDatasource = {
    type: SITEWISE_PLUGIN_ID,
    uid: datasourceUid,
  };

  return {
    title: monitorWidget.title,
    id: panelId,
    datasource,
    gridPos: toGrafanaPanelPosition(monitorWidget),
    type: toGrafanaPanelType(monitorWidget.type),
    targets: toGrafanaPanelQuery({ monitorWidget, grafanaDatasource: datasource }),
    options: toGrafanaPanelOptions(monitorWidget),
    fieldConfig: toGrafanaFieldConfig(monitorWidget),
  };
};

const toGrafanaPanelPosition = (monitorWidget: MonitorWidget): GrafanaPanelPosition => {
  return {
    h: monitorWidget.height,
    w: monitorWidget.width,
    x: monitorWidget.x,
    y: monitorWidget.y,
  };
};

const toGrafanaPanelType = (monitorWidgetType: MonitorWidgetType): GrafanaPanelType => {
  switch (monitorWidgetType) {
    case MonitorWidgetType.LineChart:
    case MonitorWidgetType.ScatterChart:
    case MonitorWidgetType.BarChart:
      return GrafanaPanelType.TimeSeries;
    case MonitorWidgetType.StatusTimeline:
      return GrafanaPanelType.StateTimeline;
    case MonitorWidgetType.Kpi:
    case MonitorWidgetType.StatusGrid:
    case MonitorWidgetType.Table:
      return GrafanaPanelType.Stat;
  }
};

const toGrafanaPanelQuery = ({
  monitorWidget,
  grafanaDatasource,
}: {
  monitorWidget: MonitorWidget;
  grafanaDatasource: GrafanaDatasource;
}): GrafanaPanelQuery[] => {
  let queryNum = 1;

  return (
    monitorWidget.metrics?.map((metric) => ({
      // Grafana only supports up to 26 queries, so we use letters A-Z
      // 'A' is ASCII 65
      refId: String.fromCharCode(queryNum++ + 65),
      queryType: toGrafanaPanelQueryType(monitorWidget.type),
      assetIds: [metric.assetId],
      propertyId: metric.propertyId,
      datasource: grafanaDatasource,
    })) ?? []
  );
};

const toGrafanaPanelQueryType = (monitorWidgetType: MonitorWidgetType): GrafanaSiteWiseQueryType => {
  switch (monitorWidgetType) {
    case MonitorWidgetType.LineChart:
    case MonitorWidgetType.ScatterChart:
    case MonitorWidgetType.BarChart:
    case MonitorWidgetType.StatusTimeline:
      return GrafanaSiteWiseQueryType.PropertyValueHistory;
    case MonitorWidgetType.Kpi:
    case MonitorWidgetType.StatusGrid:
    case MonitorWidgetType.Table:
      return GrafanaSiteWiseQueryType.PropertyValue;
  }
};

const toGrafanaPanelOptions = (monitorWidget: MonitorWidget): GrafanaPanelOptions | undefined => {
  switch (monitorWidget.type) {
    case MonitorWidgetType.Kpi:
      return {
        colorMode: 'value',
        textMode: 'value_and_name',
        wideLayout: false,
      }
    case MonitorWidgetType.StatusGrid:
      return {
        colorMode: 'background_solid',
        textMode: 'value_and_name',
        wideLayout: false,
      }
    default:
      return undefined;
  }
}

const toGrafanaFieldConfig = (monitorWidget: MonitorWidget): GrafanaFieldConfig | undefined => {
  // Only support annotations for the y field
  if (!monitorWidget.annotations?.y || monitorWidget.annotations.y.length === 0) {
    return undefined;
  }

  switch (monitorWidget.type) {
    case MonitorWidgetType.LineChart:
    case MonitorWidgetType.ScatterChart:
    case MonitorWidgetType.BarChart:
      return toTimeSeriesFieldConfig({
        monitorAnnotations: monitorWidget.annotations.y,
        monitorWidgetType: monitorWidget.type,
      });
    case MonitorWidgetType.StatusTimeline:
    case MonitorWidgetType.Kpi:
    case MonitorWidgetType.StatusGrid:
    case MonitorWidgetType.Table:
      return toNonTimeSeriesFieldConfig(monitorWidget.annotations.y);
  }
}

/**
 * Generate the Grafana panel settings based on the widget type and annotation thresholds
 * 
 * TimeSeries panel threshold considerations:
 *  - Grafana does not support y-axis auto-scaling to thresholds like SiteWise Monitor
 *    Mitigation: Use soft min/max setting with threshold values
 *  - Monitor thresholds are set statically or based on alarm thresholds
 *    This tool will just support static threshold migration
 *  - Monitor thresholds change data color based on expression valuation
 *    Grafana does not support threshold expressions, and cannot change color based
 *    on thresholds AND have unique default colors for multiple properties, so will 
 *    not support data color changes on TimeSeries panels in general
 *  - Grafana does not support labelling thresholds, but SiteWise Monitor does
 */
const toTimeSeriesFieldConfig = ({
    monitorAnnotations, 
    monitorWidgetType,
}: {
    monitorAnnotations: MonitorAnnotation[];
    monitorWidgetType: MonitorWidgetType;
}): GrafanaFieldConfig => {
  // Default base color is green
  const thresholds: GrafanaPanelThresholdStep[] = [{
    color: 'green',
  }];

  let minThreshold: number | undefined;
  let maxThreshold: number | undefined;

  monitorAnnotations.forEach((annotation) => {
    if (!minThreshold || annotation.value < minThreshold) {
      minThreshold = annotation.value;
    }
    if (!maxThreshold || annotation.value > maxThreshold) {
      maxThreshold = annotation.value;
    }
    thresholds.push({
      color: annotation.color,
      value: annotation.value,
    });
  });

  const fieldConfig: GrafanaFieldConfig = {
    defaults: {
      custom: {
        thresholdStyle: {
          mode: 'line',
        },
        axisSoftMax: maxThreshold,
        axisSoftMin: minThreshold,
      },
      thresholds: {
        mode: 'absolute',
        steps: thresholds,
      },
    },
  };

  // Change TimeSeries setting for scatter or bar chart
  if (monitorWidgetType === MonitorWidgetType.ScatterChart) {
    fieldConfig.defaults.custom!.drawStyle = 'points';
  } else if (monitorWidgetType === MonitorWidgetType.BarChart) {
    fieldConfig.defaults.custom!.drawStyle = 'bars';
  }

  return fieldConfig;
};

// Set thresholds for non-time series panels (stat, state timeline)
const toNonTimeSeriesFieldConfig = (monitorAnnotations: MonitorAnnotation[]): GrafanaFieldConfig => {
  // Default base color is green
  const baseThresholds: GrafanaPanelThresholdStep[] = [{
    color: 'green',
  }];

  return {
    defaults: {
      color: {
        mode: 'thresholds',
      },
      thresholds: {
        mode: 'absolute',
        steps: baseThresholds.concat(monitorAnnotations.map((annotation) => ({
          color: annotation.color,
          value: annotation.value,
        }))),
      }
    }
  }
}
