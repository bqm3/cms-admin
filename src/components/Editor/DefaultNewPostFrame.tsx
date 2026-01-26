/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { Frame, Element } from "@craftjs/core";

import { TextComponent } from "./Craft/Components/TextComponent";
import { Container } from "./Craft/Components/Container";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { ImageComponent } from "./Craft/Components/ImageComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { CardComponent } from "./Craft/Components/CardComponent";

import { NavbarComponent } from "./Craft/Components/NavbarComponent";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { BadgeComponent } from "./Craft/Components/BadgeComponent";
import { AccordionComponent } from "./Craft/Components/AccordionComponent";

export function DefaultNewPostFrame() {
  const PAGE_BG = "#070A0F";

  // MimicPC-like tokens
  const TEXT_SUB = "rgba(161,161,170,.92)";
  const GLASS_BG = "rgba(24,24,27,.55)";
  const GLASS_BORDER = "1px solid rgba(255,255,255,.08)";
  const GLASS_INNER = "rgba(255,255,255,.03)";
  const SHADOW = "0 20px 60px rgba(0,0,0,.45)";

  const wrapGlassCard = (children: any, padding = 20) => (
    <Element
      is={CardComponent}
      background={GLASS_BG}
      padding={0}
      radius={"sm"} // quan trọng: card bo tròn giống ảnh
      shadow={"none"}
      // border={GLASS_BORDER} // nếu CardComponent có hỗ trợ border
    >
      <div
        style={{
          padding, // ✅ bỏ p-${padding} (tailwind dynamic rất hay fail)
          border: GLASS_BORDER,
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 100%)",
          boxShadow: SHADOW,
          backdropFilter: "blur(10px)",
        }}
      >
        {children}
      </div>
    </Element>
  );

  return (
    <Frame>
      <Element
        canvas
        is={Container}
        background={PAGE_BG}
        className="min-h-screen text-white"
        height="auto"
        padding={0}
        width="100%"
      >
        {/* NAVBAR (giống ảnh: mờ + border bottom + container width) */}
        <Element
          is={NavbarComponent}
          brandText={"MimicPC"}
          items={[
            { label: "Home", href: "#home" },
            { label: "Web Tutorials", href: "#offer" },
            { label: "AI Apps", href: "#apps" },
            { label: "Pricing", href: "#pricing" },
          ]}
          sticky={false}
          blur={true}
          background={"rgba(7,10,15,.55)"}
          border={"1px solid rgba(255,255,255,.08)"}
          paddingX={24}
          paddingY={12}
          ctaText={"Free Launch"}
          ctaHref={"#pricing"}
          ctaNewTab={false}
          // nếu NavbarComponent có className:
          className="backdrop-blur-md"
        />

        {/* HERO */}
        <Element
          is={SectionComponent}
          id="home"
          canvas
          maxWidth="xl"
          paddingY={64}
          paddingX={24}
          background="transparent"
          overlay={{ enabled: false, color: "" }}
          borderRadius={0}
        >
          <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <BadgeComponent text="Open-source" color="primary" variant="soft" radius={"sm"} size={"sm"} />
                <BadgeComponent text="Customizable" color="success" variant="soft" radius={"sm"} size={"sm"} />
                <BadgeComponent text="Affordable" color="warning" variant="soft" radius={"sm"} size={"sm"} />
              </div>

              <HeadingComponent
                level="h1" // ✅ giống ảnh: headline rất to
                text="Open-Source AI Platform, Customizable & Affordable"
              />
              <div className="mt-3 max-w-[520px]">
                <TextComponent
                  text="Effortlessly create AI images, videos, and audio. Train LoRA models with custom datasets, and add custom nodes for creation possibilities."
                  fontSize={15}
                  fontWeight="400"
                  textAlign="left"
                  color={TEXT_SUB}
                />
              </div>

              <div className="mt-6 flex gap-3 flex-wrap">
                <ButtonComponent
                  text="Free Launch"
                  color="primary"
                  variant="solid"
                  size="md"
                  radius="full"
                  fullWidth={false}
                  href="#pricing"
                  openInNewTab={false}
                />
                <ButtonComponent
                  text="Join Us"
                  color="default"
                  variant="flat"
                  size="md"
                  radius="full"
                  fullWidth={false}
                  href="#footer"
                  openInNewTab={false}
                />
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs" style={{ color: TEXT_SUB }}>
                <div>✅ Fast setup</div>
                <div>✅ Cloud GPU</div>
                <div>✅ Templates</div>
              </div>
            </div>

            <div className="w-full lg:w-[520px]">
              {wrapGlassCard(
                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 14,
                    background: GLASS_INNER,
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <ImageComponent src="https://placehold.co/1040x640/png" alt="Hero visual" />
                </div>,
                18
              )}
            </div>
          </div>
        </Element>

        {/* WE CAN OFFER */}
        <Element is={SectionComponent} id="offer" canvas maxWidth="xl" paddingY={28} paddingX={24} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
          <div className="text-center mb-8">
            <HeadingComponent level="h3" text="We Can Offer" />
            <div className="mt-2">
              <TextComponent
                text="Choose an app template and workflow, then customize it to your needs."
                fontSize={14}
                fontWeight="400"
                textAlign="center"
                color={TEXT_SUB}
              />
            </div>
          </div>

          <Element is={GridComponent} canvas columns={3} gap={16} minItemWidth={260} align="stretch">
            {[
              { title: "Image Creation", desc: "Generate images with SDXL, Flux, etc." },
              { title: "Model Training", desc: "Fine-tune models with your data." },
              { title: "Video Creation", desc: "Text-to-video workflows." },
              { title: "Face Swapping", desc: "Swap faces with high quality pipeline." },
              { title: "Audio Creation", desc: "TTS / voice processing, mixing." },
              { title: "Large Language Models", desc: "Chat + tool calling, multi-agent." },
            ].map((x, idx) => (
              <Element key={idx} is={CardComponent} background={GLASS_BG} padding={0} radius={"sm"} shadow={"none"} >
                <div
                  style={{
                    padding: 18,
                    border: GLASS_BORDER,
                    borderRadius: 16,
                    background: "linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 100%)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
                  }}
                >
                  <HeadingComponent level="h4" text={x.title} />
                  <div className="mt-2">
                    <TextComponent text={x.desc} fontSize={13} fontWeight="400" textAlign="left" color={TEXT_SUB} />
                  </div>
                  <div className="mt-4" style={{ borderRadius: 14, overflow: "hidden", background: GLASS_INNER, border: "1px solid rgba(255,255,255,.06)" }}>
                    <ImageComponent src="https://placehold.co/640x360/png" alt={x.title} />
                  </div>
                </div>
              </Element>
            ))}
          </Element>
        </Element>

        {/* FAQ (demo) */}
        <Element is={SectionComponent} id="faq" canvas maxWidth="xl" paddingY={50} paddingX={24} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
          <div className="text-center mb-8">
            <HeadingComponent level="h3" text="FAQ About MimicPC" />
          </div>
          <Element
            is={AccordionComponent}
            items={[
              { title: "Is MimicPC suitable for beginners?", content: "Yes. You can start from templates and run with one click." },
              { title: "Can I use MimicPC for free?", content: "You can try the free tier, then upgrade when needed." },
              { title: "Can I upload my own models?", content: "Yes. Bring your own checkpoints/LoRA depending on your setup." },
            ]}
            allowMultiple={false}
            defaultOpenIndex={0}
            cardBg={GLASS_BG}
            border={GLASS_BORDER}
            titleColor={"rgba(255,255,255,.92)"}
            contentColor={TEXT_SUB}
          />
        </Element>

        {/* FOOTER */}
        <Element is={SectionComponent} id="footer" canvas maxWidth="xl" paddingY={48} paddingX={24} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
          {wrapGlassCard(
            <div className="flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
              <div>
                <div className="font-bold text-lg">MimicPC</div>
                <div className="mt-2 text-sm" style={{ color: TEXT_SUB }}>
                  © {new Date().getFullYear()} — Built with Craft.js builder.
                </div>
              </div>

              <div className="flex gap-6 text-sm text-white/70 flex-wrap">
                <a href="#home" className="hover:text-white">Home</a>
                <a href="#pricing" className="hover:text-white">Pricing</a>
                <a href="#faq" className="hover:text-white">FAQ</a>
                <a href="#apps" className="hover:text-white">Apps</a>
              </div>
            </div>,
            18
          )}
        </Element>
      </Element>
    </Frame>
  );
}
