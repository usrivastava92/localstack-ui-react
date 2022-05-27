import MDTypography from "components/MDTypography";
import { useState } from "react";
import { Icon } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

// Declaring props types for DefaultCell
interface Props {
  value: string;
  suffix?: string | boolean;
}

function TextOverflowEllipsisCell({ value, suffix }: Props): JSX.Element {

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(value);
  };

  return (
    <div style={{ overflow: "hidden", textOverflow: "ellipsis", width: "11rem" }}>
      <MDTypography noWrap variant="caption" fontWeight="medium" color="text">
        <Tooltip title={copied ? "Copied" : "Copy"} placement="top">
          <Icon fontSize={"small"} sx={{ mr: 1 }} onClick={handleCopy} onMouseLeave={() => setCopied(false)}>copy</Icon>
        </Tooltip>
        {value}
        {suffix && (
          <MDTypography variant="caption" fontWeight="medium" color="secondary">
            &nbsp;&nbsp;{suffix}
          </MDTypography>
        )}
      </MDTypography>
    </div>
  );
}

// Declaring default props for DefaultCell
TextOverflowEllipsisCell.defaultProps = {
  suffix: ""
};

export default TextOverflowEllipsisCell;
