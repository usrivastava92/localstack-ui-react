import { ReactNode } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import { Theme } from "@mui/material/styles";

import MDBox from "@/components/MDBox";

import DefaultNavbar from "@/examples/Navbars/DefaultNavbar";
import PageLayout from "@/examples/LayoutContainers/PageLayout";

import pageRoutes from "@/page.routes";

// Authentication pages components
import Footer from "@/layouts/authentication/components/Footer";

// Declaring props types for BasicLayout
interface Props {
  image: string;
  children: ReactNode;
}

function BasicLayout({ image, children }: Props): JSX.Element {
  return (
    <PageLayout>
      <DefaultNavbar
        routes={pageRoutes}
        action={{
          type: "external",
          route: "https://creative-tim.com/product/localstack-ui",
          label: "buy now",
          color: "info"
        }}
        transparent
        light
      />
      <MDBox
        position="absolute"
        width="100%"
        minHeight="100vh"
        sx={{
          backgroundImage: ({
                              functions: { linearGradient, rgba },
                              palette: { gradients }
                            }: Theme) =>
            image &&
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <MDBox px={1} width="100%" height="100vh" mx="auto">
        <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </MDBox>
      <Footer light />
    </PageLayout>
  );
}

export default BasicLayout;
