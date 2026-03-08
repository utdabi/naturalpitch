import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const steps = [
  {
    element: "#tour-gear",
    popover: {
      title: "Your Background",
      description: "Paste your resume here first",
    },
  },
  {
    element: "#tour-persona",
    popover: {
      title: "Target Persona",
      description: "Pick who you are writing to",
    },
  },
  {
    element: "#tour-message",
    popover: {
      title: "Your Message",
      description: "Paste your draft here",
    },
  },
  {
    element: "#tour-deep-context",
    popover: {
      title: "Deep Context",
      description: "Add their LinkedIn for a personalised opener",
    },
  },
  {
    element: "#tour-grade",
    popover: {
      title: "Grade It",
      description: "Grade your message and get rewrites",
    },
  },
];

export function useTour() {
  const startTour = useCallback(() => {
    const d = driver({
      showProgress: true,
      steps,
      onDestroyed: () => {
        localStorage.setItem("tour_done", "true");
      },
    });
    d.drive();
  }, []);

  const maybeStartTour = useCallback(() => {
    if (!localStorage.getItem("tour_done")) {
      // Small delay to let the DOM render
      setTimeout(() => {
        const d = driver({
          showProgress: true,
          steps,
          onDestroyed: () => {
            localStorage.setItem("tour_done", "true");
          },
        });
        d.drive();
      }, 500);
    }
  }, []);

  return { startTour, maybeStartTour };
}
