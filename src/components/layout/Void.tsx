import { FC } from "react";

export const Void: FC<{ height: string }> = props =>
  <div style={{ height: props.height }} />