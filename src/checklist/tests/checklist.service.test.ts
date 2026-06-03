import { describe, expect, it } from "vitest";
import type { MotorcycleQuestionnaire } from "../dto/generate-checklist.dto.js";
import { generate, evaluate } from "../checklist.service.js";

function profile(overrides?: Partial<MotorcycleQuestionnaire>): MotorcycleQuestionnaire {
  return {
    bikeType: "automatic-scooter",
    engineSize: "100-125cc",
    fuelSystem: "fuel-injected",
    cooling: "air-cooled",
    bikeAge: "2020-present",
    ...overrides,
  };
}

describe("generate", () => {
  it("returns 6 items for a minimal scooter profile", () => {
    const result = generate(profile());
    expect(result.items).toHaveLength(6);
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain("tyres");
    expect(ids).toContain("fi-light");
    expect(ids).not.toContain("chain");
  });

  it("returns 12 items for a maximal big-bike profile", () => {
    const result = generate(
      profile({
        bikeType: "sport-naked-big-bike",
        engineSize: "156cc-above",
        fuelSystem: "fuel-injected",
        cooling: "liquid-cooled",
        bikeAge: "2014-and-older",
      }),
    );
    expect(result.items).toHaveLength(12);
  });

  it("includes chain and sprocket for non-scooter bikes", () => {
    const result = generate(profile({ bikeType: "underbone" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain("chain");
    expect(ids).toContain("sprocket");
  });

  it("excludes chain and sprocket for scooter bikes", () => {
    const result = generate(profile({ bikeType: "automatic-scooter" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).not.toContain("chain");
    expect(ids).not.toContain("sprocket");
  });

  it("includes choke for carbureted bikes", () => {
    const result = generate(profile({ fuelSystem: "carbureted" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain("choke");
  });

  it("excludes choke for fuel-injected bikes", () => {
    const result = generate(profile({ fuelSystem: "fuel-injected" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).not.toContain("choke");
  });

  it("includes coolant for liquid-cooled bikes", () => {
    const result = generate(profile({ cooling: "liquid-cooled" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain("coolant");
  });

  it("excludes coolant for air-cooled bikes", () => {
    const result = generate(profile({ cooling: "air-cooled" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).not.toContain("coolant");
  });

  it("includes battery for pre-2015 bikes", () => {
    const result = generate(profile({ bikeAge: "2014-and-older" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain("battery");
  });

  it("includes brake-fluid for 156cc+ bikes", () => {
    const result = generate(profile({ engineSize: "156cc-above" }));
    const ids = result.items.map((i) => i.id);
    expect(ids).toContain("brake-fluid");
  });

  it("includes ABS for 156cc+ fuel-injected bikes only", () => {
    const fi = generate(profile({ engineSize: "156cc-above", fuelSystem: "fuel-injected" }));
    expect(fi.items.map((i) => i.id)).toContain("abs");

    const carb = generate(profile({ engineSize: "156cc-above", fuelSystem: "carbureted" }));
    expect(carb.items.map((i) => i.id)).not.toContain("abs");
  });

  it("sets all items to pending", () => {
    const result = generate(profile({ bikeType: "sport-naked-big-bike" }));
    for (const item of result.items) {
      expect(item.status).toBe("pending");
    }
  });

  it("echoes back the input profile", () => {
    const input = profile({ bikeType: "underbone", engineSize: "126-155cc" });
    const result = generate(input);
    expect(result.profile).toEqual(input);
  });

  it("generatedAt is a valid ISO string", () => {
    const result = generate(profile());
    expect(() => new Date(result.generatedAt)).not.toThrow();
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("handles empty object — returns always-shown items and chain/sprocket", () => {
    const result = generate({} as MotorcycleQuestionnaire);
    const ids = result.items.map((i) => i.id);

    expect(ids).toContain("tyres");
    expect(ids).toContain("engine-oil");
    expect(ids).toContain("brakes");
    expect(ids).toContain("lights");
    expect(ids).toContain("fuel-level");
    expect(ids).toContain("chain");
    expect(ids).toContain("sprocket");
    expect(ids).not.toContain("choke");
    expect(ids).not.toContain("fi-light");
    expect(ids).not.toContain("coolant");
    expect(ids).not.toContain("battery");
    expect(ids).not.toContain("brake-fluid");
    expect(ids).not.toContain("abs");
    expect(result.items).toHaveLength(7);
  });

  it("handles partial fields — missing bikeAge doesn't crash", () => {
    const result = generate({
      bikeType: "underbone",
      engineSize: "126-155cc",
      fuelSystem: "carbureted",
      cooling: "air-cooled",
    } as MotorcycleQuestionnaire);

    const ids = result.items.map((i) => i.id);
    expect(ids).not.toContain("battery");
    expect(ids).toHaveLength(8);
  });
});

describe("evaluate", () => {
  const input = {
    profile: profile(),
    items: generate(profile()).items,
  };

  it("returns the same items", () => {
    const result = evaluate(input);
    expect(result.items).toEqual(input.items);
  });

  it("echoes back the input profile", () => {
    const result = evaluate(input);
    expect(result.profile).toEqual(input.profile);
  });

  it("evaluatedAt is a valid ISO string", () => {
    const result = evaluate(input);
    expect(() => new Date(result.evaluatedAt)).not.toThrow();
    expect(result.evaluatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
