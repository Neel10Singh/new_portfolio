"use client";

import { ViewTransition } from "react";

export default function PageTransition({ children }) {
  return (
    <ViewTransition default="page-card">
      <div className="min-h-screen w-full ">
        {children}
      </div>
    </ViewTransition>
  );
}