import { createRouter } from "@ionic/vue-router";
import { createWebHistory, RouteRecordRaw} from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/home/HomePage.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/about/AboutPage.vue"),
  },
  {
    path: "/join/:code",
    name: "Join",
    component: () => import("@/views/join/JoinPage.vue"),
    props: true,
  },
  {
    path: "/bingo/:id",
    name: "Bingo",
    component: () => import("@/views/bingo-game/BingoPage.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;