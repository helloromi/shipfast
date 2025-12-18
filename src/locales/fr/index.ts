import { common } from "./common";
import { home } from "./home";
import { landing } from "./landing";
import { learn } from "./learn";
import { login } from "./login";
import { scenes } from "./scenes";
import { stats } from "./stats";

export const t = {
  common,
  landing,
  scenes,
  home,
  login,
  learn,
  stats,
};

export type Translations = typeof t;
