import { DotLoading, Mask } from "antd-mobile";
import { FC } from "react";

export const FullscreenLoading: FC = () =>
  <Mask>
    <DotLoading style={{ fontSize: 48 }} color='primary' />
  </Mask>