import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";

interface VideoProps {
    videoId?: string;
    source?: "youtube" | "vimeo";
    width?: string;
}

export const VideoComponent = ({
    videoId = "dQw4w9WgXcQ",
    source = "youtube",
    width = "100%",
}: VideoProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const getEmbedUrl = () => {
        if (source === "youtube") {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (source === "vimeo") {
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return "";
    };

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            className={`relative inline-block ${selected ? "ring-2 ring-purple-500" : ""}`}
            style={{ width }}
        >
            <div className="p-4 bg-white">
            <div className="aspect-video w-full">
                <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl()}
                    title="Video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-sm bg-black"
                ></iframe>
            </div>
            {selected && (
                <div className="absolute top-0 right-0 p-2 bg-black/50 text-white text-xs rounded-bl">
                    Video
                </div>
            )}
            </div>
        </div>
    );
};

const VideoSettings = () => {
    const {
        videoId,
        source,
        width,
        actions: { setProp },
    } = useNode((node: any) => ({
        videoId: node.data.props.videoId,
        source: node.data.props.source,
        width: node.data.props.width,
        actions: node.actions,
    }));

    const extractFromString = (value: string) => {
        let newId = value;
        let newSource = source;

        if (value.includes("youtube.com") || value.includes("youtu.be")) {
            newSource = "youtube";
            const match = value.match(/(?:youtu\.be\/|youtube\.com\/.*v=|youtube\.com\/embed\/)([^&?]+)/);
            if (match) newId = match[1];
        } else if (value.includes("vimeo.com")) {
            newSource = "vimeo";
            const match = value.match(/vimeo\.com\/(\d+)/);
            if (match) newId = match[1];
        }

        return { newId, newSource };
    };

    const handleUrlChange = (valueOrEvent: any) => {
        const value = typeof valueOrEvent === "string" ? valueOrEvent : valueOrEvent?.target?.value ?? "";
        const { newId, newSource } = extractFromString(value);

        setProp((props: any) => {
            props.videoId = newId;
            props.source = newSource;
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-xs text-zinc-500 block mb-1">Video URL or ID</label>
                <Input
                    size="sm"
                    value={videoId}
                    variant="bordered"
                    placeholder="Paste YouTube/Vimeo URL here"
                    onChange={(e: any) => handleUrlChange(e)}
                />
                <p className="text-[10px] text-zinc-600 mt-1">
                    Supports YouTube and Vimeo URLs or raw IDs.
                </p>
            </div>

            <div>
                <label className="text-xs text-zinc-400 mb-1 block">Source Platform</label>
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1 text-xs rounded border ${source === 'youtube' ? 'bg-purple-500 text-white border-purple-500' : 'border-zinc-700 hover:bg-zinc-800'}`}
                        onClick={() => setProp((props: any) => { props.source = 'youtube'; })}
                    >
                        YouTube
                    </button>
                    <button
                        className={`px-3 py-1 text-xs rounded border ${source === 'vimeo' ? 'bg-purple-500 text-white border-purple-500' : 'border-zinc-700 hover:bg-zinc-800'}`}
                        onClick={() => setProp((props: any) => { props.source = 'vimeo'; })}
                    >
                        Vimeo
                    </button>
                </div>
            </div>

            <div>
                <label className="text-xs text-zinc-400 mb-1 block">Width</label>
                <div className="flex gap-2">
                    <div
                        className={`w-8 h-8 flex items-center justify-center border rounded cursor-pointer ${width === "100%" ? "bg-purple-500 text-white border-purple-500" : "border-zinc-700 hover:bg-zinc-800"}`}
                        onClick={() => setProp((props: any) => (props.width = "100%"))}
                    >
                        Full
                    </div>
                    <div
                        className={`w-8 h-8 flex items-center justify-center border rounded cursor-pointer ${width === "50%" ? "bg-purple-500 text-white border-purple-500" : "border-zinc-700 hover:bg-zinc-800"}`}
                        onClick={() => setProp((props: any) => (props.width = "50%"))}
                    >
                        1/2
                    </div>
                </div>
            </div>
        </div>
    );
};

VideoComponent.craft = {
    displayName: "Video",
    props: {
        videoId: "dQw4w9WgXcQ",
        source: "youtube",
        width: "100%",
    },
    related: {
        settings: VideoSettings,
    },
};
