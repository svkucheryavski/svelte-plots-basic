export function diff(x) {
   return(x.slice(1).map( (y, i) => (y - x[i])));
}

export function min(x) {
   return(Math.min.apply(null, x));
}

export function max(x) {
   return(Math.max.apply(null, x));
}

export function range(x) {
   return([min(x), max(x)]);
}

export function mrange(x, margin) {

   if (margin < 0 || margin > 1) {
      throw "'margin' should be between 0 and 1.";
   }

   const xRange = range(x);
   const delta = (xRange[1] - xRange[0]) * margin;
   return([xRange[0] - delta, xRange[1] + delta]);
}
