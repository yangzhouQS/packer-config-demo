import { CreateWebFramework } from "@cs/js-inner-web-framework";
import App from "./App";
import router from "./router";
import "../../style";
import "./style.less";

new CreateWebFramework({
  el: "#app",
  rootComponent: App,
  router,
} as any);
