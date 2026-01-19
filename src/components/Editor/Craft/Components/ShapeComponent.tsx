
import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";
import React from "react";

interface ShapeProps {
    shapeType: "rectangle" | "circle" | "rounded-rectangle";
    width: number;
    height: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    radius: number;
}

export const ShapeComponent = ({
    shapeType = "rectangle",
    width = 100,
    height = 100,
    backgroundColor = "#3f3f46",
    borderColor = "transparent",
    borderWidth = 0,
    radius = 0,
}: ShapeProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const getBorderRadius = () => {
        if (shapeType === "circle") return "50%";
        if (shapeType === "rounded-rectangle") return `${radius}px`;
        return "0px";
    };

    return (
        <div
            ref={(ref) => {
                if (ref) connect(drag(ref));
            }}
            className={`relative inline-block ${selected ? "outline outline-2 outline-purple-500 outline-dashed" : ""
                }`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor,
                borderRadius: getBorderRadius(),
                border: `${borderWidth}px solid ${borderColor}`,
            }}
        />
    );
};

export const ShapeSettings = () => {
    const {
        shapeType,
        width,
        height,
        backgroundColor,
        borderColor,
        borderWidth,
        radius,
        actions: { setProp },
    } = useNode((node) => ({
        shapeType: node.data.props.shapeType,
        width: node.data.props.width,
        height: node.data.props.height,
        backgroundColor: node.data.props.backgroundColor,
        borderColor: node.data.props.borderColor,
        borderWidth: node.data.props.borderWidth,
        radius: node.data.props.radius,
    }));

    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-xs font-semibold text-zinc-400 mb-2">Shape Type</h4>
                <div className="flex bg-zinc-800 rounded p-1 gap-1">
                    {["rectangle", "circle", "rounded-rectangle"].map((type) => (
                        <button
                            key={type}
                            className={`flex-1 p-1 text-[10px] rounded capitalize whitespace-nowrap ${shapeType === type ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                                }`}
                            onClick={() => setProp((props: any) => (props.shapeType = type))}
                        >
                            {type.replace("-", " ")}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold text-zinc-400 mb-2">Dimensions</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-zinc-500 block mb-1">Width</label>
                        <Input
                            type="number"
                            size="sm"
                            value={width.toString()}
                            onChange={(e) => setProp((props: any) => props.width = parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 block mb-1">Height</label>
                        <Input
                            type="number"
                            size="sm"
                            value={height.toString()}
                            onChange={(e) => setProp((props: any) => props.height = parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold text-zinc-400 mb-2">Appearance</h4>
                <div className="mb-2">
                    <label className="text-[10px] text-zinc-500 block mb-1">Fill Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={backgroundColor}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                        />
                        <Input
                            size="sm"
                            value={backgroundColor}
                            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="text-[10px] text-zinc-500 block mb-1">Border Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={borderColor}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                            onChange={(e) => setProp((props: any) => props.borderColor = e.target.value)}
                        />
                        <Input
                            size="sm"
                            value={borderColor}
                            onChange={(e) => setProp((props: any) => props.borderColor = e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <label className="text-[10px] text-zinc-500 block mb-1">Border Width</label>
                        <Input
                            type="number"
                            size="sm"
                            value={borderWidth.toString()}
                            onChange={(e) => setProp((props: any) => props.borderWidth = parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 block mb-1">Radius (if rounded)</label>
                        <Input
                            type="number"
                            size="sm"
                            value={radius.toString()}
                            onChange={(e) => setProp((props: any) => props.radius = parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

ShapeComponent.craft = {
    displayName: "Shape",
    props: {
        shapeType: "rectangle",
        width: 100,
        height: 100,
        backgroundColor: "#3f3f46",
        borderColor: "transparent",
        borderWidth: 0,
        radius: 10,
    },
    related: {
        settings: ShapeSettings,
    },
};
