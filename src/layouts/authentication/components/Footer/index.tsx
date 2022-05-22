// @mui material components
import Container from "@mui/material/Container";

import MDBox from "components/MDBox";

import typography from "assets/theme/base/typography";

function Footer({ light }: { light?: boolean }): JSX.Element {
  const { size } = typography;

  return (
    <MDBox position="absolute" width="100%" bottom={0} py={4}>
      <Container>
        <MDBox
          width="100%"
          display="flex"
          flexDirection={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems="center"
          px={1.5}
        >
        </MDBox>
      </Container>
    </MDBox>
  );
}

// Declaring default props for Footer
Footer.defaultProps = {
  light: false
};

export default Footer;
