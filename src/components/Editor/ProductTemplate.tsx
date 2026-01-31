/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { TextComponent } from "./Craft/Components/TextComponent";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { SliderComponent } from "./Craft/Components/SliderComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetFooter } from "./Craft/presets/PresetFooter";

export function ProductTemplate() {
    return (
        <Element
            id="product-page"
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

            {/* Main Product Showcase */}
            <Element
                id="pr-showcase"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={60}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="pr-grid" is={GridComponent} columns={2} gap={50} canvas minItemWidth={350} align="start">
                    <Element id="pr-images" is={Container} canvas background="transparent" padding={0}>
                        <Element
                            id="pr-slider"
                            is={SliderComponent}
                            height={"500px"}
                            slides={[]}
                            overlay="rgba(0,0,0,0)"
                            autoPlay={true}
                            intervalMs={4000}
                            contentAlign="center"
                            maxContentWidth="100%"
                            paddingX={0}
                            paddingY={0}
                            titleColor="#fff"
                            subtitleColor="#fff"
                        />
                    </Element>
                    <Element id="pr-details" is={Container} canvas background="transparent" padding={0}>
                        <Element id="pr-category" is={TextComponent} text="PREMIUM ACCESSORIES" color="#6366F1" fontSize={12} fontWeight="700" textAlign="left" />
                        <Element id="pr-title" is={HeadingComponent} text="Modern Wireless Headphones" level="h1" color="#0F172A" align="left" />
                        <Element id="pr-price" is={TextComponent} text="$299.00" color="#0F172A" fontSize={28} fontWeight="700" textAlign="left" paddingTop={12} />
                        <Element id="pr-desc" is={TextComponent} text="Experience unparalleled sound quality with our latest wireless headphones. featuring active noise cancellation and 40-hour battery life." color="#64748B" fontSize={18} fontWeight="400" textAlign="left" paddingTop={24} paddingBottom={32} />
                        <Element id="pr-cta" is={ButtonComponent} text="Add to Cart" color="primary" size="lg" />
                    </Element>
                </Element>
            </Element>

            {/* Features */}
            <Element
                id="pr-features"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={80}
                paddingX={20}
                background="#F8FAFC"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="pr-feat-grid" is={GridComponent} columns={4} gap={24} canvas minItemWidth={200} align="center">
                    {["Noise Cancellation", "40h Battery", "Bluetooth 5.2", "Quick Charge"].map((feat, i) => (
                        <Element key={i} id={`pr-feat-${i}`} is={Container} canvas background="transparent" padding={0}>
                            <Element
                                background="#EEF2FF"
                                borderRadius={30}
                                height="60px"
                                id={`pr-feat-icon-${i}`}
                                is={Container}
                                margin={0}
                                width="60px"
                            />
                            <Element id={`pr-feat-title-${i}`} is={HeadingComponent} text={feat} level="h2" color="#0F172A" align="center" />
                        </Element>
                    ))}
                </Element>
            </Element>

            <Element
                id="pr-footer"
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
