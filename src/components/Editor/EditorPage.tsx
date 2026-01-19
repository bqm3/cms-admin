import { Editor, Frame, Element } from "@craftjs/core";

import { TextComponent } from "./Craft/Components/TextComponent";
import { Container } from "./Craft/Components/Container";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { ImageComponent } from "./Craft/Components/ImageComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { VideoComponent } from "./Craft/Components/VideoComponent";
import { TableComponent } from "./Craft/Components/TableComponent";
import { ShapeComponent } from "./Craft/Components/ShapeComponent";
import { Toolbox } from "./Craft/Toolbox";
import { SettingsPanel } from "./Craft/SettingsPanel";

export function EditorPage() {

  return (
    <div className="flex flex-col h-screen bg-black text-white selection:bg-purple-500/30">
      <Editor
        resolver={{
          TextComponent,
          Container,
          ButtonComponent,
          ImageComponent,
          HeadingComponent,
          CardComponent,
          VideoComponent,
          TableComponent,
          ShapeComponent,
        }}
      >
        <div className="flex-1 overflow-hidden relative">
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-12 lg:col-span-9 h-full overflow-y-auto custom-scrollbar bg-black">
              <div className="min-h-full p-8 pb-32 max-w-[1200px] mx-auto flex flex-col gap-8">

                <div className="h-[100vh] ">
                  <Frame>
                    <Element
                      canvas
                      background="#18181b"
                      is={Container}
                      padding={40}
                      margin={0}
                      width="100%"
                      height="100%"
                      flexDirection="column"
                      justifyContent="flex-start"
                      alignItems="stretch"
                      gap={0}
                      borderRadius={0}
                    >
                    </Element>
                  </Frame>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Tools & Settings */}
            <div className="col-span-12 lg:col-span-3 h-full bg-zinc-900/80 border-l border-white/10 backdrop-blur-md flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inspector
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                  <SettingsPanel />
                </div>
                <div className="border-t border-white/10 mt-4">
                  <div className="p-4 border-b border-white/10">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Library
                    </h2>
                  </div>
                  <Toolbox />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Editor>
    </div>
  );
}
