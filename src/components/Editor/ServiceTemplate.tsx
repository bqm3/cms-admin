/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { TextComponent } from "./Craft/Components/TextComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetFooter } from "./Craft/presets/PresetFooter";
import { PresetFAQ } from "./Craft/presets/PresetFAQ";

export function ServiceTemplate() {
    return (
        <Element
            id="service-page"
            is={Container}
            canvas
            padding={0}
            margin={0}
            background="#FFFFFF"
            width="100%"
            height="100%"
            className="min-h-screen"
        >
            <Element
                id="s-header"
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
                id="s-hero"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={80}
                paddingX={20}
                background="#F1F5F9"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="s-hero-content" is={Container} canvas background="transparent" padding={0}>
                    <Element
                        id="s-hero-title"
                        is={HeadingComponent}
                        text="Grow Your Business With Our Expert Solutions"
                        level="h1"
                        color="#0F172A"
                        align="center"
                    />
                    <Element
                        id="s-hero-sub"
                        is={TextComponent}
                        text="We provide end-to-end services to help you scale your operations and improve efficiency."
                        color="#475569"
                        fontSize={20}
                        textAlign="center"
                        fontWeight="400"
                        paddingTop={24}
                    />
                    <div className="flex justify-center mt-6">
                        <Element id="s-hero-cta" is={ButtonComponent} text="Get Started Now" color="primary" size="lg" />
                    </div>
                </Element>
            </Element>

            <Element
                id="s-services"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={80}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element
                    id="s-res-title"
                    is={HeadingComponent}
                    text="Our Core Services"
                    level="h2"
                    color="#0F172A"
                    align="center"
                />
                <Element id="s-grid" is={GridComponent} columns={3} gap={30} canvas minItemWidth={250} align="start">
                    {["Strategy", "Design", "Development", "Marketing", "Cloud", "Support"].map((name, i) => (
                        <Element key={i} id={`s-card-${i}`} is={Container} canvas background="#FFFFFF" padding={30} borderRadius={16}>
                            <Element id={`s-card-icon-${i}`} is={Container} background="#DBEAFE" width="50px" height="50px" borderRadius={12} margin={0} />
                            <Element id={`s-card-title-${i}`} is={HeadingComponent} text={name} level="h4" color="#0F172A" align="left" />
                            <Element id={`s-card-desc-${i}`} is={TextComponent} text="Comprehensive solutions tailored to your unique business needs and goals." color="#64748B" fontSize={15} fontWeight="400" textAlign="left" paddingTop={12} />
                        </Element>
                    ))}
                </Element>
            </Element>

            <Element
                id="s-faq"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={60}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetFAQ />
            </Element>

            <Element
                id="s-footer"
                is={SectionComponent}
                canvas
                maxWidth="full"
                paddingY={0}
                paddingX={0}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetFooter />
            </Element>
        </Element>
    );
}
