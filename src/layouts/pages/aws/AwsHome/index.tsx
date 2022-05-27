import Grid from "@mui/material/Grid";
import Footer from "../../../../examples/Footer";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import MiniInfoCard from "../../../../examples/Cards/InfoCards/MiniInfoCard";
import { useNavigate } from "react-router-dom";

function AwsHome(): JSX.Element {

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <Grid container alignItems="center" spacing={3} py={3}>
        <Grid item xs={12} md={6} lg={3} onClick={() => navigate("/pages/aws/dynamoDb")} style={{ cursor: "pointer" }}>
          <MiniInfoCard
            color="dark"
            icon="shortcut"
            title={
              <>
                Dynamo DB&nbsp;

              </>
            }
            description="Go to Dynamo DB Dashboard"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3} onClick={() => navigate("/pages/aws/sqs")} style={{ cursor: "pointer" }}>
          <MiniInfoCard
            color="info"
            icon="shortcut"
            title={
              <>
                SQS&nbsp;

              </>
            }
            description="Go to SQS Dashboard"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3} onClick={() => navigate("/pages/aws/es")} style={{ cursor: "pointer" }}>
          <MiniInfoCard
            color="success"
            icon="shortcut"
            title={
              <>
                Elastic Search&nbsp;

              </>
            }
            description="Go to Elastic Search Dashboard"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3} style={{ cursor: "pointer" }}>
          <MiniInfoCard
            color="warning"
            icon="shortcut"
            title={
              <>
                S3&nbsp;

              </>
            }
            description="Coming Soon.."
          />
        </Grid>
      </Grid>
      <Footer />
    </DashboardLayout>
  );
}

export default AwsHome;
