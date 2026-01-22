import { useNode } from "@craftjs/core";

export const PanelsTopLeft = ({ children }: any) => {
    const {
        connectors: { connect, drag },
    } = useNode();

    return (
        <div
            ref={(ref) => ref && connect(drag(ref))}
            style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                minHeight: '50px',
            }}
        >
            {children || <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>PanelsTopLeft (Legacy Component)</p>}
        </div>
    );
};

PanelsTopLeft.craft = {
    displayName: "PanelsTopLeft",
    props: {},
    rules: {
        canDrag: () => true,
        canDrop: () => true,
        canMoveIn: () => true,
        canMoveOut: () => true,
    },
};
