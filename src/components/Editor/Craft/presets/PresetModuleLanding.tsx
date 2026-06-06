/* eslint-disable react/jsx-sort-props */
import { Element } from "@craftjs/core";

import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { TextComponent } from "../Components/TextComponent";
import { ButtonComponent } from "../Components/ButtonComponent";
import { ImageComponent } from "../Components/ImageComponent";
import { TiptapComponent } from "../Components/TiptapComponent";
import { PopupOfferComponent } from "../Components/PopupOfferComponent";

export const PresetModuleLanding = () => {
  return (
    <Element
      id="preset-module-landing"
      is={Container}
      canvas
      background="transparent"
      padding={0}
      width="100%"
      height="auto"
      className="w-full"
    >
      <Element
        id="module-shell"
        is={Container}
        canvas
        background="linear-gradient(180deg, rgba(15,23,42,.96) 0%, rgba(2,6,23,.96) 100%)"
        padding={28}
        width="100%"
        height="auto"
        borderRadius={32}
        borderWidth={1}
        borderStyle="solid"
        borderColor="rgba(255,255,255,.08)"
        className="w-full overflow-hidden shadow-2xl shadow-black/20"
      >
        <Element
          id="module-grid"
          is={Container}
          canvas
          background="transparent"
          padding={0}
          width="100%"
          height="auto"
          className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.05fr_.95fr]"
        >
          <Element
            id="module-copy"
            is={Container}
            canvas
            background="transparent"
            padding={0}
            width="100%"
            height="auto"
            className="w-full"
          >
            <Element
              id="module-eyebrow"
              is={TextComponent}
              text="MODULE / Tiptap + Image + Button + Popup"
              color="rgba(148,163,184,.95)"
              fontSize={12}
              fontWeight="700"
              textAlign="left"
            />

            <Element
              id="module-title"
              is={HeadingComponent}
              level="h1"
              text="Create a reusable module and publish it to the public page"
            />

            <Element
              id="module-description"
              is={TextComponent}
              text="Admin can edit the rich text, replace the hero image, update CTA button behavior, and configure popup content. The public page will render the same Craft JSON through PublicPostPage.tsx."
              color="rgba(226,232,240,.9)"
              fontSize={16}
              fontWeight="400"
              textAlign="left"
              lineHeight="1.7"
            />

            <Element
              id="module-richtext"
              is={TiptapComponent}
              content="<p><strong>Rich content</strong> can be edited directly by the admin. Add links, buttons, formatted text, lists, and embedded images.</p><p>This block is stored in the same JSON that PublicPostPage.tsx already renders.</p>"
              placeholder="Nhập nội dung module..."
              minHeight={240}
            />

            <Element
              id="module-actions"
              is={Container}
              canvas
              background="transparent"
              padding={0}
              width="100%"
              height="auto"
              className="mt-4 flex flex-wrap gap-3"
            >
              <Element
                id="module-btn-popup"
                is={ButtonComponent}
                text="Open popup"
                color="primary"
                variant="solid"
                size="lg"
                radius="lg"
                fullWidth={false}
                action="openPopup"
                popupId="module_offer"
              />

              <Element
                id="module-btn-link"
                is={ButtonComponent}
                text="Visit offer"
                color="secondary"
                variant="bordered"
                size="lg"
                radius="lg"
                fullWidth={false}
                action="link"
                href="https://example.com"
                openInNewTab={true}
              />
            </Element>
          </Element>

          <Element
            id="module-media"
            is={Container}
            canvas
            background="transparent"
            padding={0}
            width="100%"
            height="auto"
            className="w-full"
          >
            <Element
              id="module-image"
              is={ImageComponent}
              src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1400&q=80"
              defaultAlt="Module hero image"
              width="100%"
              height="360px"
              objectFit="cover"
              radius="2xl"
            />

            <Element
              id="module-media-note"
              is={TextComponent}
              text="Upload a new image from the right-side settings panel. The same image URL will be serialized and rendered on the public page."
              color="rgba(226,232,240,.75)"
              fontSize={14}
              fontWeight="400"
              textAlign="left"
              lineHeight="1.6"
            />
          </Element>
        </Element>

        <Element
          id="module-popup"
          is={PopupOfferComponent}
          popupId="module_offer"
          enabled={true}
          delayMs={5000}
          storageKey="module_landing_popup_seen"
          openOnce={true}
          teaserEnabled={true}
          teaserText="Open module offer"
          teaserWidth={280}
          teaserOffsetX={18}
          teaserOffsetY={18}
          modalWidth={560}
          modalRadius={20}
          backdropOpacity={0.55}
          dismissOnOverlayClick={true}
          zIndex={80}
          showEditorPreview={true}
          syncTeaserWithTitle={true}
        />
      </Element>
    </Element>
  );
};

(PresetModuleLanding as any).craft = {
  displayName: "Preset / Module Landing",
};
