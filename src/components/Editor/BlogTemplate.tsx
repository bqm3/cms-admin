/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { TextComponent } from "./Craft/Components/TextComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { BadgeComponent } from "./Craft/Components/BadgeComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetFooter } from "./Craft/presets/PresetFooter";

export function BlogTemplate() {
    return (
        <Element
            id="blog-page"
            is={Container}
            canvas
            padding={0}
            margin={0}
            background="#F8FAFC"
            width="100%"
            height="100%"
            className="min-h-screen"
        >
            <Element
                id="b-header"
                is={SectionComponent}
                canvas
                maxWidth="full"
                paddingY={0}
                paddingX={0}
                background="#FFFFFF"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetHeader />
            </Element>

            <Element
                id="b-hero"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={50}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="b-hero-card" is={Container} canvas background="#FFFFFF" padding={40} borderRadius={24}>
                    <Element id="b-hero-badge" is={BadgeComponent} text="Featured Article" color="primary" variant="soft" radius={"sm"} size={"sm"} />
                    <Element
                        id="b-hero-title"
                        is={HeadingComponent}
                        text="The Future of Web Development in 2026"
                        level="h1"
                        color="#0F172A"
                        align="left"
                    />
                    <Element
                        id="b-hero-meta"
                        is={TextComponent}
                        text="Published on January 30, 2026 • 8 min read"
                        color="#64748B"
                        fontSize={14}
                        textAlign="left"
                    />
                </Element>
            </Element>

            <Element
                id="b-content"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={40}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="b-grid" is={GridComponent} columns={2} gap={30} canvas minItemWidth={300} align="start">
                    {[1, 2, 3, 4].map((i) => (
                        <Element key={i} id={`b-post-${i}`} is={Container} canvas background="transparent" padding={0}>
                            <Element id={`b-post-img-${i}`} is={Container} background="#E2E8F0" height="240px" borderRadius={16} />
                            <Element id={`b-post-cat-${i}`} is={TextComponent} text="TECHNOLOGY" color="rgba(59,130,246,1)" fontSize={12} fontWeight="700" paddingTop={15} />
                            <Element id={`b-post-title-${i}`} is={HeadingComponent} text={`Article Title Number ${i}`} level="h3" color="#0F172A" />
                            <Element id={`b-post-desc-${i}`} is={TextComponent} text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore..." color="#64748B" fontSize={16} paddingTop={10} />
                        </Element>
                    ))}
                </Element>
            </Element>

            <Element
                id="b-footer"
                is={SectionComponent}
                canvas
                maxWidth="full"
                paddingY={0}
                paddingX={0}
                background="#0F172A"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetFooter />
            </Element>
        </Element>
    );
}
