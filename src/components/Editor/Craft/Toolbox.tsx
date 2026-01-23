import { useEditor, Element } from "@craftjs/core";
import { Card } from "@heroui/card";

import { TextComponent } from "./Components/TextComponent";
import { Container } from "./Components/Container";
import { ButtonComponent } from "./Components/ButtonComponent";
import { ImageComponent } from "./Components/ImageComponent";
import { HeadingComponent } from "./Components/HeadingComponent";
import { CardComponent } from "./Components/CardComponent";
import { VideoComponent } from "./Components/VideoComponent";
import { TableComponent } from "./Components/TableComponent";
import { ShapeComponent } from "./Components/ShapeComponent";
import { RowComponent } from "./Components/RowComponent";
import { ColumnComponent } from "./Components/ColumnComponent";

export const Toolbox = () => {
  const { connectors } = useEditor();

  const basicTools = [
    {
      name: "Heading",
      icon: "H",
      component: <HeadingComponent level="h2" text="Heading" />,
    },
    {
      name: "Text",
      icon: "T",
      component: (
        <TextComponent
          fontSize={16}
          text="New Text Block"
          fontWeight="400"
          textAlign="left"
          color="#e4e4e7"
        />
      ),
    },
    {
      name: "Button",
      icon: "B",
      component: (
        <ButtonComponent
          text="Button"
          color="primary"
          variant="solid"
          size="md"
          radius="md"
          fullWidth={false}
        />
      ),
    },
    {
      name: "Image",
      icon: "🖼️",
      component: <ImageComponent />,
    },
    {
      name: "Table",
      icon: "▦",
      component: <TableComponent />,
    },
    {
      name: "Video",
      icon: "🎥",
      component: <VideoComponent />,
    },
  ];

  const shapeTools = [
    {
      name: "Rectangle",
      icon: "▭",
      component: (
        <ShapeComponent
          shapeType="rectangle"
          width={100}
          height={100}
          backgroundColor="#3f3f46"
          borderColor="transparent"
          borderWidth={0}
          radius={0}
        />
      ),
      label: "Rect",
    },
    {
      name: "Circle",
      icon: "○",
      component: (
        <ShapeComponent
          shapeType="circle"
          width={100}
          height={100}
          backgroundColor="#3f3f46"
          borderColor="transparent"
          borderWidth={0}
          radius={50}
        />
      ),
      label: "Circle",
    },
    {
      name: "Rounded",
      icon: "▢",
      component: (
        <ShapeComponent
          shapeType="rounded-rectangle"
          width={100}
          height={100}
          backgroundColor="#3f3f46"
          borderColor="transparent"
          borderWidth={0}
          radius={20}
        />
      ),
      label: "Rounded",
    },
  ];

  const layoutTools = [
    {
      name: "Container",
      icon: "□",
      component: (
        <Element
          is={Container}
          canvas
          background="#27272a"
          padding={20}
          margin={0}
          width="100%"
          height="auto"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap={0}
          borderRadius={0}
        />
      ),
      label: "Box",
    },
    {
      name: "Row 2 Col (6/6)",
      icon: "Ⅱ",
      component: (
        <Element
          is={RowComponent}
          canvas
          padding={10}
          gap={12}
          background="transparent"
        >
          <Element
            is={ColumnComponent}
            canvas
            span={6}
            padding={10}
            background="#27272a"
          />
          <Element
            is={ColumnComponent}
            canvas
            span={6}
            padding={10}
            background="#27272a"
          />
        </Element>
      ),
      label: "2 Col 6/6",
    },
    {
      name: "Row 2 Col (8/4)",
      icon: "⅙",
      component: (
        <Element
          is={RowComponent}
          canvas
          padding={8}
          gap={6}
          background="transparent"
        >
          <Element
            is={ColumnComponent}
            canvas
            span={3}
            padding={4}
            background="#27272a"
          />
          <Element
            is={ColumnComponent}
            canvas
            span={9}
            padding={4}
            background="#27272a"
          />
        </Element>
      ),
      label: "2 Col 3/9",
    },
    {
      name: "Row 2 Col (9/3)",
      icon: "⅓",
      component: (
        <Element
          is={RowComponent}
          canvas
          padding={8}
          gap={6}
          background="transparent"
        >
          <Element
            is={ColumnComponent}
            canvas
            span={9}
            padding={4}
            background="#27272a"
          />
          <Element
            is={ColumnComponent}
            canvas
            span={3}
            padding={4}
            background="#27272a"
          />
        </Element>
      ),
      label: "2 Col 9/3",
    },
    {
      name: "Row 3 Col (4/4/4)",
      icon: "Ⅲ",
      component: (
        <Element
          is={RowComponent}
          canvas
          padding={8}
          gap={6}
          background="transparent"
        >
          <Element
            is={ColumnComponent}
            canvas
            span={4}
            padding={4}
            background="#27272a"
          />
          <Element
            is={ColumnComponent}
            canvas
            span={4}
            padding={4}
            background="#27272a"
          />
          <Element
            is={ColumnComponent}
            canvas
            span={4}
            padding={4}
            background="#27272a"
          />
        </Element>
      ),
      label: "3 Col",
    },

    // {
    //   name: "V-Stack",
    //   icon: "⊟",
    //   component: (
    //     <Element
    //       is={Container}
    //       canvas
    //       background="transparent"
    //       padding={10}
    //       margin={0}
    //       width="100%"
    //       height="auto"
    //       flexDirection="column"
    //       justifyContent="flex-start"
    //       alignItems="flex-start"
    //       gap={10}
    //       borderRadius={0}
    //     />
    //   ),
    //   label: "Col",
    // },
    {
      name: "Card",
      icon: "▭",
      component: (
        <CardComponent
          background="#27272a"
          padding={20}
          radius={"md"}
          shadow={"md"}
        />
      ),
      label: "Card",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Elements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {basicTools.map((tool, idx) => (
            <div
              key={idx}
              ref={(ref: any) => connectors.create(ref, tool.component)}
            >
              <Card className="p-3 bg-zinc-800/50 cursor-move hover:bg-zinc-700/80 hover:border-purple-500/50 transition-all border border-white/5 shadow-none group">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-medium text-zinc-300 group-hover:text-purple-400 transition-colors">
                    {tool.icon}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
                    {tool.name}
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Shapes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {shapeTools.map((tool, idx) => (
            <div
              key={idx}
              ref={(ref: any) => connectors.create(ref, tool.component)}
            >
              <Card className="p-3 bg-zinc-800/50 cursor-move hover:bg-zinc-700/80 hover:border-purple-500/50 transition-all border border-white/5 shadow-none group">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-medium text-zinc-300 group-hover:text-purple-400 transition-colors">
                    {tool.icon}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
                    {tool.label}
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Structure
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {layoutTools.map((tool, idx) => (
            <div
              key={idx}
              ref={(ref: any) => connectors.create(ref, tool.component)}
            >
              <Card className="p-3 bg-zinc-800/50 cursor-move hover:bg-zinc-700/80 hover:border-purple-500/50 transition-all border border-white/5 shadow-none group">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-medium text-zinc-300 group-hover:text-purple-400 transition-colors">
                    {tool.icon}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
                    {tool.label}
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
