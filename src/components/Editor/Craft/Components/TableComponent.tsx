import React from "react";
import { useNode } from "@craftjs/core";

type TableData = string[][];

export const TableComponent = ({
  tableData = [["Cell", "Cell"], ["Cell", "Cell"]],
  border = true,
}: {
  tableData?: TableData;
  border?: boolean;
}) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    selected,
  } = useNode((state: any) => ({
    selected: state.events.selected,
  }));

  const handleCellChange = (r: number, c: number, value: string) => {
    setProp((props: any) => {
      const newData = JSON.parse(JSON.stringify(props.tableData || tableData));
      newData[r][c] = value;
      props.tableData = newData;
    });
  };

  return (
    <div ref={(ref: any) => connect(drag(ref))} className={`w-full ${selected ? "ring-2 ring-purple-500" : ""}`}>
      <table className={`w-full table-auto border-collapse ${border ? "border border-white/10" : ""}`}>
        <tbody>
          {(tableData || []).map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="p-2 align-top border border-white/5"
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleCellChange(rIdx, cIdx, e.currentTarget.textContent || "")}
                    className="min-h-[24px] text-sm text-zinc-200"
                  >
                    {cell}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TableSettings = () => {
  const {
    tableData,
    border,
    actions: { setProp },
  } = useNode((node: any) => ({
    tableData: node.data.props.tableData,
    border: node.data.props.border,
  }));

  const addRow = () => {
    setProp((props: any) => {
      const cols = props.tableData?.[0]?.length || 2;
      const newRow = Array(cols).fill("Cell");
      props.tableData = [...(props.tableData || []), newRow];
    });
  };

  const addCol = () => {
    setProp((props: any) => {
      props.tableData = (props.tableData || [["Cell"]]).map((r: any[]) => [...r, "Cell"]);
    });
  };

  const toggleBorder = () => setProp((props: any) => (props.border = !props.border));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-zinc-800 rounded" onClick={addRow}>
          Add Row
        </button>
        <button className="px-3 py-1 bg-zinc-800 rounded" onClick={addCol}>
          Add Column
        </button>
        <button className="px-3 py-1 bg-zinc-800 rounded" onClick={toggleBorder}>
          {border ? "Hide Border" : "Show Border"}
        </button>
      </div>
      <p className="text-[11px] text-zinc-500">Edit cells directly on the canvas.</p>
    </div>
  );
};

TableComponent.craft = {
  displayName: "Table",
  props: {
    tableData: [["Cell", "Cell"], ["Cell", "Cell"]],
    border: true,
  },
  related: {
    settings: TableSettings,
  },
};
