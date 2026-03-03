"use client";

import { useEffect } from "react";

export function ExportPrintTrigger() {
  useEffect(() => {
    window.print();
  }, []);
  return null;
}
