import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Dette historique (~67 occurrences, surtout le pipeline d'import) :
      // visible en warning, ne bloque pas la CI. Repassera en "error" une fois
      // les types Supabase générés (supabase gen types typescript).
      "@typescript-eslint/no-explicit-any": "warn",
      // Incompatible avec du texte français (apostrophes/guillemets dans le JSX).
      "react/no-unescaped-entities": "off",
      // Composants pré-existants (admin, stats) : à corriger au prochain passage.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
