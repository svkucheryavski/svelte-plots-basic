export const Colors = {
   "AXIS_LINE": "#303030",
   "AXIS_TICK": "#606060",
   "WHITE":     "#fff",
   "BLACK":     "#000",
   "GRAY":      "#909090",
   "MIDDLEGRAY": "#dadada",
   "LIGHTGRAY": "#f0f0f0",
   "DARKGRAY":  "#606060",
   "LEGEND": "#303030",

   "PRIMARY": "#2679B2",
   "PRIMARY_LIGHT": "#66A9F2",
   "PRIMARY_TEXT": "#333",
}


/**
 * Returns an array with 'n' colors.
 *
 * @param {number} n - number of colors to return.
 *
 * @returns {Array} array with colors as strings (hexadecimal).
 *
 */
export function getcolmap(n) {
   if (n ==  1) return ["#2679B2"];
   if (n ==  2) return ["#2679B2", "#D22C2F"];
   if (n ==  3) return ["#2679B2", "#92B42A", "#D22C2F"];
   if (n ==  4) return ["#2679B2", "#2E9658", "#F2B825", "#D22C2F"];
   if (n ==  5) return ["#2679B2", "#22988A", "#92B42A", "#F79426", "#D22C2F"];
   if (n ==  6) return ["#2679B2", "#1C9AA8", "#379531", "#EED524", "#FB7F28", "#D22C2F"];
   if (n ==  7) return ["#2679B2", "#1D94A9", "#2E9658", "#92B42A", "#F2B825", "#F47129", "#D22C2F"];
   if (n ==  8) return ["#2679B2", "#1E90AA", "#279775", "#519E2F", "#D3CB25", "#F5A326", "#EF672A", "#D22C2F"];
   if (n ==  9) return ["#2679B2", "#1F8DAB", "#22988A", "#33953F", "#92B42A", "#EFCA24", "#F79426", "#EB5F2A", "#D22C2F"];
   if (n == 10) return ["#2679B2", "#208BAC", "#1E999A", "#2E9658", "#5FA32E", "#C5C626", "#F2B825", "#F98827", "#E85A2B", "#D22C2F"];
   if (n == 11) return ["#2679B2", "#2089AD", "#1C9AA8", "#29976C", "#379531", "#92B42A", "#EED524", "#F4AA26", "#FB7F28",
      "#E6552B", "#D22C2F"];
   if (n == 12) return ["#2679B2", "#2188AD", "#1C97A8", "#25987C", "#329546", "#68A62D", "#BCC327", "#F0C524", "#F69E26",
      "#F77728", "#E4512B", "#D22C2F"];
   if (n == 13) return ["#2679B2", "#2186AD", "#1D94A9", "#22988A", "#2E9658", "#469A2F", "#92B42A", "#DECF25", "#F2B825",
      "#F79426", "#F47129", "#E34E2C", "#D22C2F"];
   if (n == 14) return ["#2679B2", "#2285AE", "#1E92AA", "#209995", "#2A9767", "#34953A", "#6FA82D", "#B5C128", "#EFCE24", "#F3AD25",
      "#F98C27", "#F16B29", "#E14B2C", "#D22C2F"];
   if (n == 15) return ["#2679B2", "#2284AE", "#1E90AA", "#1D999F", "#279775", "#31964A", "#519E2F", "#92B42A", "#D3CB25", "#F0C224",
      "#F5A326", "#FA8527", "#EF672A", "#E0492C", "#D22C2F"];

   // if n > 15 return 16 colors
   return ["#2679B2", "#2283AE", "#1F8FAB", "#1C9AA8", "#249880", "#2E9658", "#379531", "#73AA2C", "#B0BF28", "#EDD424", "#F2B825",
      "#F69B26", "#FB7F28", "#ED632A", "#DF472C", "#D22C2F"];
}
