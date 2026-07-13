import { common } from "./common";
import { home } from "./home";
import { landing } from "./landing";
import { learn } from "./learn";
import { login } from "./login";
import { pricing } from "./pricing";
import { professeurs } from "./professeurs";
import { scenes } from "./scenes";
import { stats } from "./stats";
import { teacher } from "./teacher";

export const t = {
  common,
  landing,
  scenes,
  home,
  login,
  learn,
  stats,
  pricing,
  professeurs,
  teacher,
};

export type Translations = typeof t;
