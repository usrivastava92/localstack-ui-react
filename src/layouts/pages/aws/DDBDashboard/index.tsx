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
import {ColumnDefinition, TableData} from "../types/tableTypes";
import MDButton from "../../../../components/MDButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

function getStringAttributeValue(value: any): string {
  if (!value) {
    return "";
  }
  return JSON.stringify(value);
}

function getColumnDefinitions(items: { [key: string]: AttributeValue; }[]): ColumnDefinition[] {
  const columnDefinitions: ColumnDefinition[] = [];
  if (!items || items.length <= 0) {
    return columnDefinitions;
  }
  const columnsDefsAlreadyAdded = new Set<string>();
  items.forEach(item => {
    Object.keys(item).forEach((key) => {
      if (!columnsDefsAlreadyAdded.has(key)) {
        columnDefinitions.push({
          Header: key,
          accessor: key,
          Cell: (value) => <DefaultCell value={getStringAttributeValue(value.value)} />
        });
        columnsDefsAlreadyAdded.add(key);
      }
    });
  });
  return columnDefinitions.sort((one, two) => (one.Header < two.Header ? -1 : 1));
}

function getRows(items: { [key: string]: AttributeValue; }[]): any[] {
  const rows: any[] = [];
  if (!items || items.length <= 0) {
    return rows;
  }
  return items.map(item => unmarshall(item));
}

function getTableData(scanOutput: ScanCommandOutput): TableData {
  if (!scanOutput) {
    return { columns: [], rows: [] };
  }
  return {
    columns: getColumnDefinitions(scanOutput.Items),
    rows: getRows(scanOutput.Items)
  };
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new DynamoDB(getClientConfig(awsProfile));

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>();
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  function listTables() : void {
    if (awsProfile !== nullAwsProfile) {
      client.listTables({Limit: 10})
        .then(output => {
          if (output && output.TableNames && output.TableNames.length > 0) {
            setTables(output.TableNames);
          }
        }).catch(error => console.error(error));
    }
  }

  useEffect(listTables, []);

  function scanTable(tableName: string) {
    if (tableName) {
      setSelectedTable(tableName);
      client.scan({TableName: tableName})
        .then(output => setTableData(getTableData(output)))
        .catch(error => console.error(error));
    }
  }

  return (
    <div>
      <MDBox my={3} sx={{ maxHeight: "50%" }}>
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
            <MDBox display="flex" justifyContent="space-between">
              <Tooltip title="Reload Data" placement="left">
                <MDButton sx={{mr: 3}} variant="gradient" color="info" onClick={() => {
                  listTables();
                  scanTable(selectedTable);
                }}>
                  <Icon fontSize={"large"}>cached</Icon>
                </MDButton>
              </Tooltip>
              <Autocomplete
                disableClearable
                sx={{width: "12rem", borderRadius: 3}}
                value={selectedTable ? selectedTable : "No table Selected"}
                options={tables}
                onChange={(e, v) => scanTable(v as string)}
                renderInput={(params) => <MDInput {...params} label="Table" fullWidth/>}
              />
            </MDBox>
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true}/>
        </Card>
      </MDBox>
    </div>
  );
}

function DDBDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout title="Dynamo DB" subTitle="Create/Choose a profile and then select a table to view your data">
      <Content />
    </AwsDashboardLayout>
  );
}

export default DDBDashboard;
