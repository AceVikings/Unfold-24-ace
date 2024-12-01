import { useEffect } from "react";
import { backButton, useSignal } from "@telegram-apps/sdk-react";

/**
 * Component which controls the Back Button visibility.
 */
export function BackButton() {
  const isVisible = useSignal(backButton.isVisible);

  useEffect(() => {
    console.log("The button is", isVisible ? "visible" : "invisible");
  }, [isVisible]);

  useEffect(() => {
    backButton.show();
    return () => {
      backButton.hide();
    };
  }, []);

  return null;
}
