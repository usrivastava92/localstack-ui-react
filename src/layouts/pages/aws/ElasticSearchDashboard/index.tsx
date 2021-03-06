import { useContext, useEffect, useState } from 'react';
import AwsDashboardLayout from '../AwsDashboardLayout';
import { Card } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { AWSProfile, nullAwsProfile } from '../types/awsTypes';
import { AWSProfileContext } from '../../../../context';
import { getClientConfig } from '../utils/awsUtils';
import {
  DescribeElasticsearchDomainCommand,
  ElasticsearchDomainStatus,
  ElasticsearchServiceClient,
  ListDomainNamesCommand
} from '@aws-sdk/client-elasticsearch-service';
import { ColumnDefinition, TableData } from '../types/tableTypes';
import DefaultCell from '../../../ecommerce/orders/order-list/components/DefaultCell';
import Autocomplete from '@mui/material/Autocomplete';
import MDInput from '../../../../components/MDInput';
import DataTable from '../../../../examples/Tables/DataTable';
import {
  CatIndicesResponse,
  ElasticSearchClient,
  ElasticSearchClientImpl
} from '../../../../services/ElasticSearchClient';
import MDButton from '../../../../components/MDButton';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import { defaultSBProps, getErrorSBProps } from '../utils/notificationUtils';
import MDSnackbar, { SBProps } from '../../../../components/MDSnackbar';

const esColumnDefinitions: ColumnDefinition[] = [
  {
    Header: 'Index',
    accessor: 'index',
    Cell: ({ value }: { value: string }) => <DefaultCell value={value} />
  },
  {
    Header: 'Health',
    accessor: 'health',
    Cell: ({ value }: { value: string }) => <DefaultCell value={value} />
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: ({ value }: { value: string }) => <DefaultCell value={value} />
  },
  {
    Header: 'Docs Count',
    accessor: 'docsCount',
    Cell: ({ value }: { value: string }) => <DefaultCell value={value} />
  },
  {
    Header: 'Docs Deleted',
    accessor: 'docsDeleted',
    Cell: ({ value }: { value: string }) => <DefaultCell value={value} />
  }
];

interface EsRowDefinitions {
  index: string;
  health: string;
  status: string;
  docsCount: string;
  docsDeleted: string;
}

function getRows(catIndicesResponse: CatIndicesResponse): EsRowDefinitions[] {
  if (!catIndicesResponse) {
    return [];
  }
  return catIndicesResponse.map((index) => {
    return {
      index: index.index,
      health: index.health,
      status: index.status,
      docsCount: index['docs.count'],
      docsDeleted: index['docs.deleted']
    };
  });
}

function getTableData(response: CatIndicesResponse): TableData {
  if (!response) {
    return { columns: esColumnDefinitions, rows: [] };
  }
  return {
    columns: esColumnDefinitions,
    rows: getRows(response)
  };
}

function createEndpoint(esDomainStatus: ElasticsearchDomainStatus): string {
  const endpointScheme = esDomainStatus.DomainEndpointOptions.EnforceHTTPS
    ? 'https://'
    : 'http://';
  return `${endpointScheme}${esDomainStatus.Endpoint}`;
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new ElasticsearchServiceClient(getClientConfig(awsProfile));

  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>();
  const [sbProps, setSBProps] = useState<SBProps>(defaultSBProps);
  const [esClient, setEsClient] = useState<ElasticSearchClient>();
  const [tableData, setTableData] = useState<TableData>(
    getTableData(undefined)
  );

  function listDomains(): void {
    if (awsProfile !== nullAwsProfile) {
      client
        .send(new ListDomainNamesCommand({}))
        .then((output) => {
          if (output && output.DomainNames && output.DomainNames.length > 0) {
            setDomains(
              output.DomainNames.map<string>(
                (domainInfo) => domainInfo.DomainName
              )
            );
          }
        })
        .catch((error) => {
          console.error(error);
          setSBProps(
            getErrorSBProps({
              title: 'AWS Error',
              content: String(error),
              open: true,
              onClose: () => setSBProps(defaultSBProps),
              close: () => setSBProps(defaultSBProps)
            })
          );
        });
    }
  }

  useEffect(listDomains, []);

  function listIndexes(domainName: string) {
    if (domainName) {
      client
        .send(
          new DescribeElasticsearchDomainCommand({ DomainName: domainName })
        )
        .then((output) => {
          if (output && output.DomainStatus && output.DomainStatus.Endpoint) {
            if (domainName !== selectedDomain) {
              setSelectedDomain(domainName);
              const newEsClient = new ElasticSearchClientImpl({
                endpoint: createEndpoint(output.DomainStatus)
              });
              setEsClient(newEsClient);
              newEsClient.cat
                .indices()
                .then((response) => setTableData(getTableData(response)))
                .catch((error) => console.error(error));
            }
          }
        })
        .catch((error) => {
          console.error(error);
          setSBProps(
            getErrorSBProps({
              title: 'AWS Error',
              content: String(error),
              open: true,
              onClose: () => setSBProps(defaultSBProps),
              close: () => setSBProps(defaultSBProps)
            })
          );
        });
    }
  }

  return (
    <div>
      <MDBox my={3} sx={{ maxHeight: '50%' }}>
        <Card>
          <MDBox
            p={3}
            lineHeight={1}
            display="flex"
            justifyContent="space-between"
          >
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                Index View
              </MDTypography>
              <MDTypography variant="button" color="text">
                Here is the list of indexes in
                {selectedDomain ? (
                  <MDTypography
                    display="inline"
                    fontWeight="bold"
                    variant="button"
                    color="text"
                  >
                    &nbsp;{selectedDomain}
                  </MDTypography>
                ) : (
                  ' '
                )}{' '}
                domain
              </MDTypography>
            </MDBox>
            <MDBox display="flex" justifyContent="space-between">
              <Tooltip title="Reload Data" placement="left">
                <MDButton
                  sx={{ mr: 3 }}
                  variant="gradient"
                  color="info"
                  onClick={() => {
                    listDomains();
                    listIndexes(selectedDomain);
                  }}
                >
                  <Icon fontSize={'large'}>cached</Icon>
                </MDButton>
              </Tooltip>
              <Autocomplete
                disableClearable
                sx={{ width: '12rem', borderRadius: 3 }}
                value={selectedDomain ? selectedDomain : 'No Domain Selected'}
                options={domains}
                onChange={(e, v) => listIndexes(v as string)}
                renderInput={(params) => (
                  <MDInput {...params} label="Domain" fullWidth />
                )}
              />
            </MDBox>
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true} />
        </Card>
      </MDBox>
      <MDSnackbar
        color={sbProps.color}
        icon={sbProps.icon}
        title={sbProps.title}
        content={sbProps.content}
        dateTime={sbProps.dateTime}
        open={sbProps.open}
        onClose={sbProps.onClose}
        close={sbProps.close}
        bgWhite
      />
    </div>
  );
}

function ElasticSearchDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout
      title="Elastic Search"
      subTitle="Create/Choose a profile"
    >
      <Content />
    </AwsDashboardLayout>
  );
}

export default ElasticSearchDashboard;
