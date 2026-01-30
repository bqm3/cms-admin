/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { TextComponent } from "./Craft/Components/TextComponent";
import { InputComponent } from "./Craft/Components/InputComponent";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetFooter } from "./Craft/presets/PresetFooter";

export function ContactTemplate() {
    return (
        <Element
            id="contact-page"
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
                id="c-header"
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
                id="c-hero"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={80}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="c-grid" is={GridComponent} columns={2} gap={60} canvas minItemWidth={300} align="start">
                    {/* Left Column: Info */}
                    <Element id="c-info" is={Container} canvas background="transparent" padding={0}>
                        <Element
                            id="c-title"
                            is={HeadingComponent}
                            text="Let's Talk About Your Project"
                            level="h1"
                            color="#0F172A"
                            align="left"
                        />
                        <Element
                            id="c-sub"
                            is={TextComponent}
                            text="Have a question or a proposal? We'd love to hear from you. Send us a message and we'll respond within 24 hours."
                            color="#64748B"
                            fontSize={18}
                            textAlign="left"
                            fontWeight="400"
                            paddingTop={24}
                            paddingBottom={40}
                        />

                        <Element id="c-details" is={Container} canvas padding={0} background="transparent">
                            {["sales@example.com", "+1 (555) 000-0000", "123 Innovation Drive, Silicon Valley, CA"].map((item, i) => (
                                <Element key={i} id={`c-item-${i}`} is={Container} canvas background="transparent" padding={10}>
                                    <Element id={`c-item-text-${i}`} is={TextComponent} text={item} color="#0F172A" fontSize={16} fontWeight="600" textAlign="left" />
                                </Element>
                            ))}
                        </Element>
                    </Element>

                    {/* Right Column: Form */}
                    <Element id="c-form-card" is={Container} canvas background="#F8FAFC" padding={40} borderRadius={24}>
                        <Element id="c-form-title" is={HeadingComponent} text="Send a Message" level="h3" color="#0F172A" align="left" />
                        <div className="mt-6">
                            <Element id="c-f-name" is={InputComponent} label="Full Name" placeholder="John Doe" />
                            <div className="mt-4">
                                <Element id="c-f-email" is={InputComponent} label="Email Address" placeholder="john@example.com" />
                            </div>
                            <div className="mt-4">
                                <Element id="c-f-subject" is={InputComponent} label="Subject" placeholder="How can we help?" />
                            </div>
                            <div className="mt-6">
                                <Element id="c-f-btn" is={ButtonComponent} text="Send Message" color="primary" fullWidth={true} />
                            </div>
                        </div>
                    </Element>
                </Element>
            </Element>

            <Element
                id="c-footer"
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
