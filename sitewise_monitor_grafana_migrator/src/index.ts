import { AmazonManagedGrafanaClient } from './clients/amazonManagedGrafana/client';
import { IotSiteWiseClient } from './clients/sitewise/client';
import { parseArgs } from './parseInput';

/**
 * Main file parses command line arguments and calls client wrappers to fetch SiteWise Monitor
 * portal resources and convert them to Amazon Managed Grafana resources.
 */

const { portalId, region, workspaceId } = parseArgs();

const main = async () => {
  // Client wrapper to fetch all portal resources
  const sitewiseClient = new IotSiteWiseClient({
    region,
    portalId,
  });

  const portalResourceMap = await sitewiseClient.getPortalResources();

  // Client wrapper to create Grafana resources
  const amazonManagedGrafanaClient = new AmazonManagedGrafanaClient({
    region,
    workspaceId,
  });

  // Create Grafana resources
  await amazonManagedGrafanaClient.migrateToGrafanaResources(portalResourceMap);
};

void main();
