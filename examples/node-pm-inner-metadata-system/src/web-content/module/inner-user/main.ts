import { CreateWebFramework } from "@cs/js-inner-web-framework";
import App from "./App";
import router from "./router";
import "../../style";
import "./style.less";

new CreateWebFramework({
  rootComponent: App,
  router,
});
