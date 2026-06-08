import { describe, it, expect } from "vitest";
import { slugify, generateCourseSlug } from "../../server/lib/slug";

describe("slugify", () => {
  it("converts Vietnamese text to URL-safe slug", () => {
    expect(slugify("Học ReactJS cơ bản")).toBe("hoc-reactjs-co-ban");
  });

  it("handles special characters", () => {
    expect(slugify("Visual Studio Code 2024!")).toBe("visual-studio-code-2024");
  });
});

describe("generateCourseSlug", () => {
  it("uses title when long enough", () => {
    expect(generateCourseSlug("Lập trình Python cho người mới")).toContain("lap-trinh");
  });
});
