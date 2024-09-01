import { DotLoading, Mask } from "antd-mobile";
import { FC } from "react";

export const FullscreenLoading: FC = () =>
  <Mask style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
    <DotLoading style={{ fontSize: 48 }} color='primary' />
  </Mask>