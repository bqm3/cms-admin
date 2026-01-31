/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { TextComponent } from "./Craft/Components/TextComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetFooter } from "./Craft/presets/PresetFooter";

export function PortfolioTemplate() {
    return (
        <Element
            id="portfolio-page"
            is={Container}
            canvas
            padding={0}
            margin={0}
            background="#0D0F14"
            width="100%"
            height="100%"
            className="min-h-screen"
        >
            <Element
                id="p-header"
                is={SectionComponent}
                canvas
                maxWidth="full"
                paddingY={0}
                paddingX={0}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetHeader />
            </Element>

            <Element
                id="p-hero"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={60}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="p-hero-content" is={Container} canvas background="transparent" padding={0}>
                    <Element
                        id="p-hero-title"
                        is={HeadingComponent}
                        text="Creative Portfolio Showcase"
                        level="h1"
                        color="#FFFFFF"
                        align="center"
                    />
                    <Element
                        id="p-hero-sub"
                        is={TextComponent}
                        text="Designing digital experiences that matter. We combine strategy, design and technology to deliver results."
                        color="rgba(255,255,255,0.7)"
                        fontSize={18}
                        textAlign="center"
                        paddingTop={20}
                    />
                </Element>
            </Element>

            <Element
                id="p-gallery"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={40}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element
                    id="p-gallery-title"
                    is={HeadingComponent}
                    text="Featured Works"
                    level="h2"
                    color="#FFFFFF"
                    align="left"
                />
                <Element id="p-grid" is={GridComponent} columns={3} gap={20} canvas minItemWidth={200} align="start">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Element key={i} id={`p-work-${i}`} is={CardComponent} canvas padding={0} background="#161922" radius="md" shadow="sm">
                            <Element
                                id={`p-work-img-${i}`}
                                is={Container}
                                background="rgba(255,255,255,0.05)"
                                height="200px"
                                width="100%"
                            />
                            <Element id={`p-work-info-${i}`} is={Container} canvas padding={15} background="transparent">
                                <Element id={`p-work-title-${i}`} is={HeadingComponent} text={`Project Name ${i}`} level="h4" color="#FFFFFF" />
                                <Element id={`p-work-desc-${i}`} is={TextComponent} text="Brand Identity / UI Design" color="rgba(255,255,255,0.5)" fontSize={13} />
                            </Element>
                        </Element>
                    ))}
                </Element>
            </Element>

            <Element
                id="p-footer"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={40}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetFooter />
            </Element>
        </Element>
    );
}
