export const POPUP_BUS_EVENT = "craft:popup";

export type PopupBusDetail =
  | { type: "open"; popupId: string }
  | { type: "close"; popupId: string }
  | { type: "closeAll" };

export function openPopup(popupId: string) {
  window.dispatchEvent(
    new CustomEvent<PopupBusDetail>(POPUP_BUS_EVENT, {
      detail: { type: "open", popupId },
    }),
  );
}

export function closePopup(popupId: string) {
  window.dispatchEvent(
    new CustomEvent<PopupBusDetail>(POPUP_BUS_EVENT, {
      detail: { type: "close", popupId },
    }),
  );
}

export function closeAllPopups() {
  window.dispatchEvent(
    new CustomEvent<PopupBusDetail>(POPUP_BUS_EVENT, {
      detail: { type: "closeAll" },
    }),
  );
}
