import { useContext, useEffect, useState } from "react";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";
import AWSProfileContext from "../context";
// Data
import dataTableData from "layouts/ecommerce/orders/order-list/data/dataTableData";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import MDTypography from "../../../../components/MDTypography";
import Menu from "@mui/material/Menu";
import MDBox from "../../../../components/MDBox";
import Card from "@mui/material/Card";
import DataTable from "../../../../examples/Tables/DataTable";


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

function OrderList(): JSX.Element {
  const [menu, setMenu] = useState(null);

  const openMenu = (event: any) => setMenu(event.currentTarget);
  const closeMenu = () => setMenu(null);

  const renderMenu = (
    <Menu
      anchorEl={menu}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      open={Boolean(menu)}
      onClose={closeMenu}
      keepMounted
    >
      <MenuItem onClick={closeMenu}>Status: Paid</MenuItem>
      <MenuItem onClick={closeMenu}>Status: Refunded</MenuItem>
      <MenuItem onClick={closeMenu}>Status: Canceled</MenuItem>
      <Divider sx={{ margin: "0.5rem 0" }} />
      <MenuItem onClick={closeMenu}>
        <MDTypography variant="button" color="error" fontWeight="regular">
          Remove Filter
        </MDTypography>
      </MenuItem>
    </Menu>
  );

  return (
    <MDBox my={3} sx={{ maxHeight: '50%' }}>
      <Card>
        <MDBox p={3} lineHeight={1}>
          <MDTypography variant="h5" fontWeight="medium">
            Tables
          </MDTypography>
          <MDTypography variant="button" color="text">
            Here is a list of tables found in your profile
          </MDTypography>
        </MDBox>
        <DataTable table={dataTableData} />
      </Card>
    </MDBox>
  );
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new DynamoDB(getClientConfig(awsProfile));

  const [tables, setTables] = useState([]);

  const listTables = () => client.listTables({ Limit: 10 })
    .then(output => {
      console.log(`output ${JSON.stringify(output)}`);
      setTables(output?.TableNames);
    }).catch(error => console.log(error));

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      listTables();
    }
  }, []);

  return (
    <div>
      {tables.map(name => <div key={name}>{name}</div>)}
      <OrderList />
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
