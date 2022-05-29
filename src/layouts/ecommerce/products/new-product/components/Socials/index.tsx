// @mui material components
import Grid from '@mui/material/Grid';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// NewProduct page components
import FormField from 'layouts/ecommerce/products/new-product/components/FormField';

function Socials(): JSX.Element {
  return (
    <MDBox>
      <MDTypography variant="h5" fontWeight="bold">
        Socials
      </MDTypography>
      <MDBox mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormField type="text" label="Shoppify Handle" />
          </Grid>
          <Grid item xs={12}>
            <FormField type="text" label="Facebook Account" />
          </Grid>
          <Grid item xs={12}>
            <FormField type="text" label="Instagram Account" />
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default Socials;
