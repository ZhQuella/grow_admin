import { App, Component } from "vue";
import { version } from "../package.json";
import { GRenderer } from "./packages/GRenderer";
import { GDesigner } from "./packages/GDesigner";

import "animate.css";
import "@grow-rock/grow-editor/dist/index.css";
import "./styles/tailwindcss/index.css";
import "./styles/animate/index.css";

const components: Component[] = [GRenderer, GDesigner];

const install = (app: App) => {
  const useComponent = (component: Component) => {
    if (component.name) {
      app.component(component.name, component);
    } else {
      throw "component need name";
    }
  };
  components.forEach((component: Component) => {
    useComponent(component);
  });
};

const GrowConponent = {
  version,
  install,
  GDesigner,
  GRenderer
};

export { version, GRenderer, GDesigner };

export default GrowConponent;
