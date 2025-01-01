// how big are margins (number of pixels in unit margin value) between axis and plot area if axis are shown
export const AXES_MARGIN_FACTORS = {
   'small': 30,
   'medium': 40,
   'large': 50,
   'xlarge': 60
}

// number of x-ticks along each axis
export const XTICK_NUM = {
   'small': 5,
   'medium': 8,
   'large': 12,
   'xlarge': 15
};

// number of y-ticks along each axis
export const YTICK_NUM = {
   'small': 6,
   'medium': 10,
   'large': 14,
   'xlarge': 18
};

// size of ticks
export const TICK_SIZE = {
   'small': 4,
   'medium': 6,
   'large': 8,
   'xlarge': 10
};

// font size for plot element
export const LEGEND_FONT_SIZE = {
   "small": 11,
   "medium": 14,
   "large": 16,
   "xlarge": 18
};

// font size for legend items in pixels
export const PLOT_FONT_SIZE = {
   "small": 12,
   "medium": 15,
   "large": 19,
   "xlarge": 21
};

// margin between plot series elements and data labels
export const LABELS_MARGIN = {
   'small': 11,
   'medium': 15,
   'large': 17,
   'xlarge': 19
};

// line styles for different scales and types
export const LINE_STYLES = {
   small: ['0', '3,3', '1,1', '3,1'],
   medium: ['0', '5,5', '2,2', '5,2'],
   large: ['0', '7,7', '3,3', '7,3'],
   xlarge: ['0', '9,9', '4,4', '9,3'],
}

// marker symbols
export const MARKER_SYMBOLS = ["●", "◼", "▲", "▼", "⬥", "＋", "✳", "✕"];

// colormap legend parameters
export const COLMAP_WIDTH_RATIO = 0.80;    // legend will span 80% of plot width
export const COLMAP_TOP_MARGIN = 0.50;     // legend top margin is 25% of its height

// height of the legend elements in pixels
export const COLMAP_EL_HEIGHTS_PX = {'small': 5, 'medium': 8, 'large': 12, 'xlarge': 15};

// number of bins to split matrix values into in heatmap
export const HEATMAP_NUM_SPLITS = 12;

export const Colors = {
   "WHITE":     "#fff",
   "BLACK":     "#000",
   "GRAY":      "#909090",
   "MIDDLEGRAY": "#dadada",
   "LIGHTGRAY": "#f0f0f0",
   "DARKGRAY":  "#606060",
   "LEGEND": "#303030",

   "PRIMARY": "#2679B2",
   "PRIMARY_LIGHT": "#d2ebff",
   "PRIMARY_TEXT": "#333",

   "AXIS_LINE": "#303030",
   "AXIS_TICK": "#606060",
   "CLEGEND_LABELS": "#606060"
}


// number of ticks along each axis for 3D plots
export const TICK_NUM = {
   "small": 5,
   "medium": 8,
   "large": 12,
   "xlarge": 15
};