<script>
   import TextLabels from './TextLabels.svelte';
   import { Colors } from './Colors';

   /* input parameters */
	export let x;
   export let y;
   export let dx = "0";
   export let dy = "1.25em";
   export let elements;
   export let pos = 0;
   export let faceColor = Colors.PRIMARY_TEXT;
   export let borderColor = "transparent";
   export let borderWidth = 0;
   export let textSize = 1;

   let labelsStr = "";

   $: {
      labelsStr = "";
      for (let i = 0; i < elements.length; i++) {
         labelsStr += `<tspan x=0 dx=${dx} dy=${i === 0 ? 0 : dy}>${elements[i]}</tspan>`
      }
   }
</script>

<TextLabels {textSize} {borderColor} {borderWidth} {faceColor} xValues={[x]} yValues={[y]} {pos} labels={labelsStr} />
