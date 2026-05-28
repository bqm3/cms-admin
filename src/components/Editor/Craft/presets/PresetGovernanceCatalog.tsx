import React from "react";
import { Element } from "@craftjs/core";
import { RowComponent } from "../Components/RowComponent";
import { ColumnComponent } from "../Components/ColumnComponent";
import { DynamicNavTreeComponent } from "../Components/DynamicNavTreeComponent";
import { GovernanceTableComponent } from "../Components/GovernanceTableComponent";

export const PresetGovernanceCatalog = () => {
  return (
    <Element
      is={RowComponent}
      canvas
      padding={0}
      gap={0}
      background="#f9fafb" // Light background for the dashboard area
    >
      {/* Left Sidebar */}
      <Element
        is={ColumnComponent}
        canvas
        span={4}
        padding={0}
        background="#1e1e2e"
      >
        <DynamicNavTreeComponent
          title="Loại dữ liệu"
          url="https://dev-api.cdsdservice.com/microservice-governance/api/SYS_DST_TYPE/getlist"
        // width="100%"
        />
      </Element>

      {/* Right Content */}
      <Element
        is={ColumnComponent}
        canvas
        span={8}
        padding={20}
        background="#ffffff"
      >
        <GovernanceTableComponent
          targetNodeCode="sysDataSourceType"
        />
      </Element>
    </Element>
  );
};

(PresetGovernanceCatalog as any).craft = {
  displayName: "Governance Catalog",
};
