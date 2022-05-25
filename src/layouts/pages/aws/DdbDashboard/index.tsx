import {useContext, useEffect, useState} from "react";
import {DynamoDB, DynamoDBClientConfig, ScanCommandOutput} from "@aws-sdk/client-dynamodb";
import AwsDashboardLayout from "../AwsDashboardLayout";
import {AWSProfile, nullAwsProfile} from "../types/awsTypes";
import {AWSProfileContext} from "context";
// Data
import dataTableData from "layouts/ecommerce/orders/order-list/data/dataTableData";
import MDTypography from "../../../../components/MDTypography";
import MDBox from "../../../../components/MDBox";
import Card from "@mui/material/Card";
import DataTable from "../../../../examples/Tables/DataTable";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "../../../../components/MDInput";
import IdCell from "../../../ecommerce/orders/order-list/components/IdCell";
import DefaultCell from "../../../ecommerce/orders/order-list/components/DefaultCell";
import StatusCell from "../../../ecommerce/orders/order-list/components/StatusCell";
import CustomerCell from "../../../ecommerce/orders/order-list/components/CustomerCell";
import team2 from "../../../../assets/images/team-2.jpg";
import team1 from "../../../../assets/images/team-1.jpg";
import {AttributeValue} from "@aws-sdk/client-dynamodb/dist-types/models/models_0";


function getClientConfig(awsProfile: AWSProfile): DynamoDBClientConfig {
  return {
    region: awsProfile.region,
    credentials: {
      accessKeyId: awsProfile.accessKey,
      secretAccessKey: awsProfile.secretKey,
      sessionToken: (awsProfile.sessionToken && awsProfile.sessionToken !== "") ? awsProfile.sessionToken : undefined
    },
    endpoint: (awsProfile.endpoint && awsProfile.endpoint !== "") ? awsProfile.endpoint : undefined
  };
}

function getColumns(items: { [key: string]: AttributeValue; }[]): any {
  if (!items || items.length <= 0) {
    return []
  }
  return [
    {Header: "id", accessor: "id", Cell: ({value}: any) => <IdCell id={value}/>},
    {
      Header: "date",
      accessor: "date",
      Cell: ({value}: any) => <DefaultCell value={value}/>
    },
    {
      Header: "status",
      accessor: "status",
      Cell: ({value}: any) => {
        let status;

        if (value === "paid") {
          status = <StatusCell icon="done" color="success" status="Paid"/>;
        } else if (value === "refunded") {
          status = <StatusCell icon="replay" color="dark" status="Refunded"/>;
        } else {
          status = <StatusCell icon="close" color="error" status="Canceled"/>;
        }

        return status;
      }
    },
    {
      Header: "customer",
      accessor: "customer",
      Cell: ({value: [name, data]}: any) => (
        <CustomerCell image={data.image} color={data.color || "dark"} name={name}/>
      )
    },
    {
      Header: "product",
      accessor: "product",
      Cell: ({value}: any) => {
        const [name, data] = value;

        return (
          <DefaultCell
            value={typeof value === "string" ? value : name}
            suffix={data.suffix || false}
          />
        );
      }
    },
    {
      Header: "revenue",
      accessor: "revenue",
      Cell: ({value}: any) => <DefaultCell value={value}/>
    }
  ]
}

function getTableData(scanOutput: ScanCommandOutput): any {
  return {
    columns: getColumns(scanOutput.Items),
    rows: [
      {
        id: "#10421",
        date: "1 Nov, 10:20 AM",
        status: "paid",
        customer: ["Orlando Imieto", {image: team2}],
        product: "Nike Sport V2",
        revenue: "$140,20"
      },
      {
        id: "#10422",
        date: "1 Nov, 10:53 AM",
        status: "paid",
        customer: ["Alice Murinho", {image: team1}],
        product: "Valvet T-shirt",
        revenue: "$42,00"
      },
    ]
  }
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new DynamoDB(getClientConfig(awsProfile));

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>();
  const [tableData, setTableData] = useState<any>(dataTableData);

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      client.listTables({Limit: 10})
        .then(output => {
          console.log(`list table : ${JSON.stringify(output)}`);
          setTables(output?.TableNames);
        }).catch(error => console.log(error));
    }
  }, []);

  function scanTable(tableName: string) {
    setSelectedTable(tableName)
    client.scan({TableName: tableName})
      .then(output => {
        setTableData(getTableData(output))
        console.log(`scan table success`);
      }).catch(error => console.log(error));
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
                    : "table"
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
          <DataTable table={tableData} canSearch={true}/>
        </Card>
      </MDBox>
    </div>
  );
}

function DdbDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout>
      <Content />
    </AwsDashboardLayout>
  );
}

export default DdbDashboard;
