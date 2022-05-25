// @mui material components
// Settings page components

import {useContext, useEffect, useState} from "react";
import AwsDashboardLayout from "../AwsDashboardLayout";
import {Card} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {AWSProfile, nullAwsProfile} from "../types/awsTypes";
import {AWSProfileContext} from "../../../../context";
import {getClientConfig} from "../utils/awsUtils";
import {
  DescribeElasticsearchDomainCommand,
  ElasticsearchServiceClient,
  ListDomainNamesCommand
} from "@aws-sdk/client-elasticsearch-service";
import {ColumnDefinition, TableData} from "../types/tableTypes";
import DefaultCell from "../../../ecommerce/orders/order-list/components/DefaultCell";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "../../../../components/MDInput";
import DataTable from "../../../../examples/Tables/DataTable";
import {Client} from "@elastic/elasticsearch";
import {CatIndicesIndicesRecord, CatIndicesResponse} from "@elastic/elasticsearch/lib/api/types";

const columnDefinitions: ColumnDefinition[] = [
  {Header: 'Index Name', accessor: "name", Cell: ({value}: { value: string }) => <DefaultCell value={value}/>}
]

interface RowDefinition {
  name: string,
  docsCount: string,
  bulkAvgSizeInBytes: string,
  status: string,
}

function getRows(indices: CatIndicesIndicesRecord[]): RowDefinition[] {
  const rows: RowDefinition[] = [];
  if (!indices || indices.length <= 0) {
    return rows;
  }
  return indices.map<RowDefinition>(index => {
    return {
      name: index.index,
      docsCount: index.docsCount,
      bulkAvgSizeInBytes: index.bulkAvgSizeInBytes,
      status: index.status,
    }
  });
}

function getTableData(response: CatIndicesResponse): TableData {
  if (!response) {
    return {columns: [], rows: []};
  }
  return {
    columns: columnDefinitions,
    rows: getRows(response)
  };
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new ElasticsearchServiceClient(getClientConfig(awsProfile));

  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>();
  const [esClient, setEsClient] = useState<Client>();
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      client.send(new ListDomainNamesCommand({}))
        .then(output => {
          if (output && output.DomainNames && output.DomainNames.length > 0) {
            setDomains(output.DomainNames.map<string>(domainInfo => domainInfo.DomainName))
          }
        }).catch(error => console.error(error));
    }
  }, []);

  function listIndexes(domainName: string) {
    client.send(new DescribeElasticsearchDomainCommand({DomainName: domainName}))
      .then(output => {
        if (output && output.DomainStatus && output.DomainStatus.Endpoint) {
          if (domainName !== selectedDomain) {
            setSelectedDomain(domainName);
            setEsClient(new Client({
              node: output.DomainStatus.Endpoint
            }))
          }
          esClient.cat.indices()
            .then(output => setTableData(getTableData(output)))
            .catch(error => console.error(error))
        }
      })
      .catch(error => console.error(error))
    console.log("scanning index")
  }

  return (
    <div>
      <MDBox my={3} sx={{maxHeight: "50%"}}>
        <Card>
          <MDBox p={3} lineHeight={1} display="flex" justifyContent="space-between">
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                Index View
              </MDTypography>
              <MDTypography variant="button" color="text">
                Here is the list of indexes in
                {
                  selectedDomain ?
                    <MDTypography
                      display="inline"
                      fontWeight="bold"
                      variant="button"
                      color="text">
                      &nbsp;{selectedDomain}
                    </MDTypography>
                    : " "
                } domain
              </MDTypography>
            </MDBox>
            <Autocomplete
              disableClearable
              sx={{width: "12rem", borderRadius: 3}}
              value={selectedDomain ? selectedDomain : "No Domain Selected"}
              options={domains}
              onChange={(e, v) => listIndexes(v as string)}
              renderInput={(params) => <MDInput {...params} label="Domain" fullWidth/>}
            />
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true}/>
        </Card>
      </MDBox>
    </div>
  );
}

function ElasticSearchDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout title="Elastic Search" subTitle="Create/Choose a profile">
      <Content/>
    </AwsDashboardLayout>
  );
}

export default ElasticSearchDashboard;
