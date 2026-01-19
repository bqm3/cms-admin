import { useNode } from "@craftjs/core";
import { useState, useEffect, useMemo } from "react";
import ContentEditable from "react-contenteditable";
import { Input } from "@heroui/input";
import { useEditorData } from "../../../../context/EditorDataContext";

export const TextComponent = ({
    text,
    fontSize,
    fontWeight,
    textAlign,
    color,
    lineHeight = "1.5",
    letterSpacing = "normal",
}: {
    text: string;
    fontSize: number;
    fontWeight: string;
    textAlign: string;
    color: string;
    lineHeight?: string;
    letterSpacing?: string;
}) => {
    const {
        connectors: { connect, drag },
        actions: { setProp },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const [editable, setEditable] = useState(false);

    const { data } = useEditorData();

    const resolveToken = (path: string, src: any) => {
        try {
            const parts = path.replace(/\[(\d+)\]/g, '.$1').split(".").map((p) => p.trim());
            let cur = src;
            for (const p of parts) {
                if (cur == null) return undefined;
                cur = cur[p];
            }
            return cur;
        } catch (e) {
            return undefined;
        }
    };

    const resolvedText = useMemo(() => {
        if (!text || typeof text !== "string") return text;
        return text.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
            const value = resolveToken(token.trim(), data);
            return value === undefined || value === null ? match : String(value);
        });
    }, [text, data]);

    useEffect(() => {
        if (selected) {
            return;
        }
        setEditable(false);
    }, [selected]);

    return (
        <div
            ref={(ref) => {
                if (ref) connect(drag(ref));
            }}
            className={`${selected ? "border-1 border-blue-500 border-dashed" : "border border-transparent"} p-1 min-w-[50px]`}
            onClick={() => selected && setEditable(true)}
        >
            <ContentEditable
                disabled={!editable}
                html={editable ? text : resolvedText}
                style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight as any,
                    textAlign: textAlign as any,
                    color,
                    lineHeight: lineHeight || "1.5",
                    letterSpacing: letterSpacing || "normal",
                }}
                tagName="p"
                onChange={(e) => {
                    setProp((props: any) => (props.text = e.target.value));
                }}
            />
        </div>
    );
};

export const TextSettings = () => {
    const {
        fontSize,
        fontWeight,
        textAlign,
        color,
        lineHeight,
        letterSpacing,
        actions: { setProp }
    } = useNode((node) => ({
        fontSize: node.data.props.fontSize,
        fontWeight: node.data.props.fontWeight,
        textAlign: node.data.props.textAlign,
        color: node.data.props.color,
        lineHeight: node.data.props.lineHeight,
        letterSpacing: node.data.props.letterSpacing,
    }));

    return (
        <div className="space-y-4">
            <div>
                <label className="text-xs text-zinc-500 block mb-2">Typography</label>
                <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                        <label className="text-[10px] text-zinc-500 mb-1 block">Size</label>
                        <input
                            type="number"
                            className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
                            value={fontSize}
                            onChange={(e) => setProp((props: any) => props.fontSize = parseInt(e.target.value))}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-zinc-500 mb-1 block">Weight</label>
                        <select
                            className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
                            value={fontWeight}
                            onChange={(e) => setProp((props: any) => props.fontWeight = e.target.value)}
                        >
                            <option value="400">Normal</option>
                            <option value="500">Medium</option>
                            <option value="700">Bold</option>
                            <option value="900">Black</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                        <label className="text-[10px] text-zinc-500 mb-1 block">Line Height</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
                            value={lineHeight || "1.5"}
                            onChange={(e) => setProp((props: any) => props.lineHeight = e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-zinc-500 mb-1 block">Tracking</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
                            value={letterSpacing || "normal"}
                            onChange={(e) => setProp((props: any) => props.letterSpacing = e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-2">
                    <label className="text-[10px] text-zinc-500 mb-1 block">Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={color}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                            onChange={(e) => setProp((props: any) => props.color = e.target.value)}
                        />
                        <Input
                            size="sm"
                            variant="bordered"
                            value={color}
                            onChange={(e) => setProp((props: any) => props.color = e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>

                <div className="mb-2">
                    <label className="text-[10px] text-zinc-500 mb-1 block">Alignment</label>
                    <div className="flex bg-zinc-800 rounded p-1 gap-1">
                        {['left', 'center', 'right', 'justify'].map((align) => (
                            <button
                                key={align}
                                className={`flex-1 p-1 text-xs rounded uppercase ${textAlign === align ? 'bg-purple-600 text-white' : 'hover:bg-zinc-700'}`}
                                onClick={() => setProp((props: any) => props.textAlign = align)}
                            >
                                {align.charAt(0)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

TextComponent.craft = {
    displayName: "Text",
    props: {
        text: "Type here...",
        fontSize: 16,
        fontWeight: "400",
        textAlign: "left",
        color: "#e4e4e7",
        lineHeight: "1.5",
        letterSpacing: "normal",
    },
    related: {
        settings: TextSettings,
    },
};
