import {useContext, useEffect, useState} from "react";
import {DynamoDB, ScanCommandOutput} from "@aws-sdk/client-dynamodb";
import AwsDashboardLayout from "../AwsDashboardLayout";
import {AWSProfile, nullAwsProfile} from "../types/awsTypes";
import {AWSProfileContext} from "context";
// Data
import MDTypography from "../../../../components/MDTypography";
import MDBox from "../../../../components/MDBox";
import Card from "@mui/material/Card";
import DataTable from "../../../../examples/Tables/DataTable";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "../../../../components/MDInput";
import DefaultCell from "../../../ecommerce/orders/order-list/components/DefaultCell";
import {AttributeValue} from "@aws-sdk/client-dynamodb/dist-types/models/models_0";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {getClientConfig} from "../utils/awsUtils";

interface ColumnDefinition {
  Header: string,
  accessor: string,
  Cell: ({value}: { value: any }) => JSX.Element
}

function getStringAttributeValue(value: any): string {
  if (!value) {
    return ""
  }
  return JSON.stringify(value)
}

function getColumnDefinitions(items: { [key: string]: AttributeValue; }[]): ColumnDefinition[] {
  const columnDefinitions: ColumnDefinition[] = [];
  if (!items || items.length <= 0) {
    return columnDefinitions
  }
  const columnsDefsAlreadyAdded = new Set<string>();
  items.forEach(item => {
    Object.keys(item).forEach((key) => {
      if (!columnsDefsAlreadyAdded.has(key)) {
        columnDefinitions.push({
          Header: key,
          accessor: key,
          Cell: (value) => <DefaultCell value={getStringAttributeValue(value.value)}/>
        })
        columnsDefsAlreadyAdded.add(key)
      }
    })
  })
  return columnDefinitions.sort((one, two) => (one.Header < two.Header ? -1 : 1));
}

function getRows(items: { [key: string]: AttributeValue; }[]): any[] {
  const rows: any[] = [];
  if (!items || items.length <= 0) {
    return rows
  }
  return items.map(item => unmarshall(item));
}

interface TableData {
  columns: ColumnDefinition[],
  rows: any[]
}

function getTableData(scanOutput: ScanCommandOutput): TableData {
  if (!scanOutput) {
    return {columns: [], rows: []}
  }
  return {
    columns: getColumnDefinitions(scanOutput.Items),
    rows: getRows(scanOutput.Items)
  }
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new DynamoDB(getClientConfig(awsProfile));

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>();
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      client.listTables({Limit: 10})
        .then(output => setTables(output?.TableNames))
        .catch(error => console.log(error));
    }
  }, []);

  function scanTable(tableName: string) {
    setSelectedTable(tableName)
    client.scan({TableName: tableName})
      .then(output => setTableData(getTableData(output)))
      .catch(error => console.log(error));
  }

  return (
    <div>
      <MDBox my={3} sx={{maxHeight: '50%'}}>
        <Card>
          <MDBox p={3} lineHeight={1} display="flex" justifyContent="space-between">
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                Data View
              </MDTypography>
              <MDTypography variant="button" color="text">
                Here is the data view for
                {
                  selectedTable ?
                    <MDTypography
                      display="inline"
                      fontWeight="bold"
                      variant="button"
                      color="text">
                      &nbsp;{selectedTable}
                    </MDTypography>
                    : " table"
                }
              </MDTypography>
            </MDBox>
            <Autocomplete
              disableClearable
              sx={{width: '12rem', borderRadius: 3}}
              value={selectedTable ? selectedTable : "No table Selected"}
              options={tables}
              onChange={(e, v) => scanTable(v as string)}
              renderInput={(params) => <MDInput {...params} label="Table" fullWidth/>}
            />
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true}/>
        </Card>
      </MDBox>
    </div>
  );
}

function DDBDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout>
      <Content/>
    </AwsDashboardLayout>
  );
}

export default DDBDashboard;
