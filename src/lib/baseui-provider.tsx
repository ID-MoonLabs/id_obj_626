"use client";

import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme } from "baseui";
import { ReactNode, useState, useEffect } from "react";

export function BaseUIProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<Styletron | null>(null);

  useEffect(() => {
    // 只在客户端初始化 Styletron
    setEngine(new Styletron());
  }, []);

  if (!engine) {
    // SSR 时返回一个简单的包装器，避免样式闪烁
    return <>{children}</>;
  }

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        {children}
      </BaseProvider>
    </StyletronProvider>
  );
}

