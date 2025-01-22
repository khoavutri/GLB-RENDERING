import { KhoaTools } from "./main/main";

console.log("The product is owned by Vu Tri Khoa");
if (typeof module !== "undefined" && module.exports) {
  module.exports = { KhoaTools };
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return { KhoaTools };
  });
} else {
  (window as any).KhoaTools = KhoaTools;
}
