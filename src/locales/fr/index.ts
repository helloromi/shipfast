import { common } from "./common";
import { home } from "./home";
import { landing } from "./landing";
import { learn } from "./learn";
import { login } from "./login";
import { pricing } from "./pricing";
import { scenes } from "./scenes";
import { stats } from "./stats";
import { account } from "./account";

export const t = {
  common,
  landing,
  scenes,
  home,
  login,
  learn,
  stats,
  pricing,
  account,
};

export type Translations = typeof t;
