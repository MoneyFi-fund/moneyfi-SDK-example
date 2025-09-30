import React from "react";
import Chains from "./chains";
import Tokens from "./tokens";

export default function Supported() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Chains />
      <Tokens />
    </div>
  );
}
