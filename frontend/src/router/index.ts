import { createRouter } from "@ionic/vue-router";
import { createWebHistory, RouteRecordRaw} from "vue-router";
import HomePage from "@/views/home/HomePage.vue";
import BingoPage from "@/views/bingo-game/BingoPage.vue";
import AboutPage from "@/views/about/AboutPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/about",
    name: "About",
    component: AboutPage,
  },
  {
    path: "/bingo/:id",
    name: "Bingo",
    component: BingoPage,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
