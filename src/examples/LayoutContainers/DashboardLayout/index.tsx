import { ReactNode, useEffect } from 'react';

// react-router-dom components
import { useLocation } from 'react-router-dom';

import MDBox from 'components/MDBox';

import { setLayout, useMaterialUIController } from 'context';

function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, 'dashboard');
  }, [pathname]);

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: 'relative',

        [breakpoints.up('xl')]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(['margin-left', 'margin-right'], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard
          })
        }
      })}
    >
      {children}
    </MDBox>
  );
}

export default DashboardLayout;
