import minimist from 'minimist';

export interface Arguments {
  portalId: string; // SWM portal to migrate to Amazon Managed Grafana
  region: string; // Region name (e.g. us-east-1)
  workspaceId: string; // Amazon Managed Grafana workspace created for the portal
}

export const help = () => {
  console.log(`Configure the AWS credentials in your environment for the AWS CLI: https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-configure.html
  
  Usage: 
  
    This script migrates your SiteWise Monitor resources into Amazon Managed Grafana resources.

    arguments:
      --region        REQUIRED
      --portalId      REQUIRED
      --workspaceId   REQUIRED

    You must provide a region, an IoT SiteWise portalId for the source of your projects and dashboards, and the Amazon Managed Grafana workspaceId,
    for the destination of the Grafana folders and dashboards.

    This tool assumes you already have an Amazon Managed Grafana workspace configured with identities assigned to it.

    Example comamand:
      npx ts-node src/index.ts --region us-east-1 --portalId 12345678-9012-3456-7890-abcdef123456 --workspaceId g-1234567890
    `);
};

// Overwrite field 

// Parses command-line arguments for the sample files to extract the supported settings.
export const parseArgs = (): Arguments => {
  const args: Arguments = {
    portalId: '',
    region: '',
    workspaceId: '',
  };
  const parsedArgs = minimist(process.argv.slice(2));
  for (const arg of Object.keys(parsedArgs)) {
    switch (arg) {
      case 'h':
      case 'help':
        help();
        process.exit(0);
      case 'portalId':
        args.portalId = parsedArgs[arg];
        break;
      case 'region':
        args.region = parsedArgs[arg];
        break;
      case 'workspaceId':
        args.workspaceId = parsedArgs[arg];
        break;
      case '_':
        break;
      default:
        console.error(`unknown arg "--${arg}"`);
        help();
        process.exit(1);
    }
  }

  if (args.portalId === '' || args.region === '' || args.workspaceId === '') {
    help();
    process.exit(1);
  }
  return args;
};
