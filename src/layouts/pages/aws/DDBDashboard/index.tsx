import { useContext, useEffect, useState } from "react";
import { DynamoDB, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";
import { AWSProfileContext } from "@/context";
import MDTypography from "@/components/MDTypography";
import MDBox from "@/components/MDBox";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "@/components/MDInput";
import { AttributeValue } from "@aws-sdk/client-dynamodb/dist-types/models/models_0";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getClientConfig } from "../utils/awsUtils";
import { TableData } from "../types/tableTypes";
import MDButton from "../../../../components/MDButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import MDSnackbar, { SBProps } from "../../../../components/MDSnackbar";
import { defaultSBProps, getErrorSBProps } from "../utils/notificationUtils";
import { DataGrid } from "@mui/x-data-grid";
import { GridEnrichedColDef } from "@mui/x-data-grid/models/colDef/gridColDef";
import { GridRowModel } from "@mui/x-data-grid/models/gridRows";
import Box from "@mui/material/Box";

function getStringAttributeValue(value: any): string {
  if (!value) {
    return "";
  }
  return JSON.stringify(value);
}

function getColumnDefinitions(items: { [key: string]: AttributeValue; }[]): GridEnrichedColDef[] {
  const columnDefinitions: GridEnrichedColDef[] = [];
  if (!items || items.length <= 0) {
    return columnDefinitions;
  }
  const columnsDefsAlreadyAdded = new Set<string>();
  items.forEach(item => {
    Object.keys(item).forEach((key) => {
      if (!columnsDefsAlreadyAdded.has(key)) {
        columnDefinitions.push({
          field: key,
          headerName: key
        });
        columnsDefsAlreadyAdded.add(key);
      }
    });
  });
  return columnDefinitions;
}

function getRows(items: { [key: string]: AttributeValue; }[]): GridRowModel[] {
  const rows: any[] = [];
  if (!items || items.length <= 0) {
    return rows;
  }
  return items.map((item, index) => {
    return { ...unmarshall(item), id: index };
  });
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
  const [sbProps, setSBProps] = useState<SBProps>(defaultSBProps);
  const [selectedTable, setSelectedTable] = useState<string>();
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  function listTables(): void {
    if (awsProfile !== nullAwsProfile) {
      client.listTables({ Limit: 10 })
        .then(output => {
          if (output && output.TableNames && output.TableNames.length > 0) {
            setTables(output.TableNames);
          }
        }).catch(error => {
        console.error(error);
        setSBProps(getErrorSBProps({
          title: "AWS Error",
          content: String(error),
          open: true,
          onClose: () => setSBProps(defaultSBProps),
          close: () => setSBProps(defaultSBProps)
        }));
      });
    }
  }

  useEffect(listTables, []);

  function scanTable(tableName: string) {
    if (tableName) {
      setIsTableLoading(true);
      setSelectedTable(tableName);
      client.scan({ TableName: tableName })
        .then(output => setTableData(getTableData(output)))
        .catch(error => {
          console.error(error);
          setSBProps(getErrorSBProps({
            title: "AWS Error",
            content: String(error),
            open: true,
            onClose: () => setSBProps(defaultSBProps),
            close: () => setSBProps(defaultSBProps)
          }));
        });
      setIsTableLoading(false);
    }
  }

  return (
    <Box border={1}>
      <MDBox my={3}>
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
                <MDButton sx={{ mr: 3 }} variant="gradient" color="info" onClick={() => {
                  listTables();
                  scanTable(selectedTable);
                }}>
                  <Icon fontSize={"large"}>cached</Icon>
                </MDButton>
              </Tooltip>
              <Autocomplete
                disableClearable
                sx={{ width: "12rem", borderRadius: 3 }}
                value={selectedTable ? selectedTable : "No table Selected"}
                options={tables}
                onChange={(e, v) => scanTable(v as string)}
                renderInput={(params) => <MDInput {...params} label="Table" fullWidth />}
              />
            </MDBox>
          </MDBox>
          <DataGrid
            sx={{ p: 2, m: 2 }}
            loading={isTableLoading}
            columns={tableData.columns}
            rows={tableData.rows}
            pageSize={10}
            autoPageSize
          />
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
    </Box>
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
