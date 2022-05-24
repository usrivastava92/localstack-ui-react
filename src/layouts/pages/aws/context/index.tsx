import { createContext } from "react";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";

const AWSProfileContext = createContext<AWSProfile>(nullAwsProfile);
export default AWSProfileContext;