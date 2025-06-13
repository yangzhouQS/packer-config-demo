import { createRouter, createWebHashHistory } from "vue-router";
import { MainPage } from "./components/main-page";

const routes = [
  {
    path: "/",
    name: "index",
    meta: {
      title: "首页",
    },
    component: MainPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
