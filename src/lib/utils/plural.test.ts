import { describe, expect, it } from "vitest";

import { countLabel, plural } from "./plural";

const ELEVES = { one: "élève", other: "élèves" };

describe("plural", () => {
  it("met au singulier 0 et 1 (règle française)", () => {
    expect(plural(0, ELEVES)).toBe("élève");
    expect(plural(1, ELEVES)).toBe("élève");
  });

  it("met au pluriel à partir de 2", () => {
    expect(plural(2, ELEVES)).toBe("élèves");
    expect(plural(12, ELEVES)).toBe("élèves");
  });
});

describe("countLabel", () => {
  it("préfixe le nombre à la forme accordée", () => {
    expect(countLabel(0, ELEVES)).toBe("0 élève");
    expect(countLabel(1, ELEVES)).toBe("1 élève");
    expect(countLabel(3, ELEVES)).toBe("3 élèves");
  });
});
