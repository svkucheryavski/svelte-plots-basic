<!--
@component Modal dialog for advanced PNG export with live preview and dimension/resolution controls.

   Properties:
   - `plotElement` - reference to the SVG element to export.
   - `fileName` - file name for download (without extension).
   - `initialWidth` - initial width in cm (default: 8).
   - `initialRes` - initial resolution in DPI (default: 300).
   - `onclose` - callback when dialog is closed.
-->
<script>
   import { downloadPNG } from './methods.js';

   let {
      plotElement,
      fileName = 'plot',
      initialWidth = 8,
      initialRes = 300,
      onclose
   } = $props();

   // aspect ratio from the actual SVG element
   const svgWidth = plotElement ? (plotElement.clientWidth || plotElement.getBoundingClientRect().width) : 1;
   const svgHeight = plotElement ? (plotElement.clientHeight || plotElement.getBoundingClientRect().height) : 1;
   const aspectRatio = svgWidth / svgHeight;

   // editable state — height always derived from width to preserve aspect ratio
   const resOptions = [100, 150, 300, 600];
   const parsedInitialRes = Number(initialRes);
   const defaultRes = resOptions.includes(parsedInitialRes) ? parsedInitialRes : 300;

   let width = $state(initialWidth);
   const height = $derived(Math.max(4, Math.min(20, Math.round(width / aspectRatio * 10) / 10)));
   let res = $state(defaultRes);
   let name = $state(fileName);
   const nameValid = $derived(name.trim().length > 0);

   // preview container ref
   let previewContainer = $state(null);

   // max preview width in pixels
   const maxPreviewWidth = 400;
   const previewHeight = $derived(Math.round(maxPreviewWidth / aspectRatio));

   // clone SVG into preview container on mount
   $effect(() => {
      if (!previewContainer || !plotElement) return;

      // clear previous content
      previewContainer.innerHTML = '';

      // clone the SVG
      const clone = plotElement.cloneNode(true);

      clone.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
      clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.position = 'static';

      // fixes duplicate clipPath IDs
      const clipPaths = clone.querySelectorAll('clipPath');
      clipPaths.forEach((cp) => {
         const oldId = cp.getAttribute('id');
         if (oldId) {
            const newId = 'preview_' + oldId;
            cp.setAttribute('id', newId);
            const refs = clone.querySelectorAll(`[clip-path="url(#${oldId})"]`);
            refs.forEach((ref) => ref.setAttribute('clip-path', `url(#${newId})`));
         }
      });

      previewContainer.appendChild(clone);
   });

   function handleWidthChange(e) {
      width = parseFloat(e.target.value);
   }

   let saving = $state(false);

   function handleSave() {
      if (saving) return;
      saving = true;

      const container = plotElement.parentElement;
      const origStyle = container.style.cssText;

      // scale reference width with export width so smaller plots get
      // a smaller scale category → relatively larger fonts and details
      // 4cm → 360px (small), 8cm → 520px (medium), 16cm → 840px (large), 20cm → 1000px (xlarge)
      const refWidth = Math.round(200 + width * 40);
      const refHeight = Math.round(refWidth / aspectRatio);

      function doExport() {
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               // onSerialize callback fires after downloadPNG has serialized the SVG,
               // so we can safely restore the container and close the dialog
               downloadPNG(plotElement, name.trim(), width, height, res, () => {
                  container.style.cssText = origStyle;
                  saving = false;
                  onclose();
               });
            });
         });
      }

      // temporarily resize plot container to a fixed reference size (off-screen,
      // hidden behind the dialog backdrop) so Svelte recomputes the layout
      container.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${refWidth}px;height:${refHeight}px;overflow:hidden;`;

      // wait for ResizeObserver → Svelte bindings → derived recomputation → DOM update
      // fallback timeout in case container is already at the target size
      const fallbackTimer = setTimeout(() => { observer.disconnect(); doExport(); }, 500);
      const observer = new ResizeObserver(() => {
         observer.disconnect();
         clearTimeout(fallbackTimer);
         doExport();
      });
      observer.observe(plotElement);
   }

   function handleBackdropClick() {
      if (!saving) onclose();
   }

   function handleDialogClick(e) {
      e.stopPropagation();
   }

   // close on Escape key
   $effect(() => {
      function handleKeydown(e) {
         if (e.key === 'Escape' && !saving) {
            onclose();
         }
      }
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
   });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="export-dialog-backdrop" onclick={handleBackdropClick}>
   <div class="export-dialog" onclick={handleDialogClick}>
      <div class="export-dialog-title">Export as PNG</div>

      <div class="export-dialog-body">
         <!-- Preview -->
         <div class="export-dialog-preview"
            style="width:{maxPreviewWidth}px;height:{previewHeight}px;"
            bind:this={previewContainer}
         ></div>

         <!-- Controls -->
         <div class="export-dialog-controls">
            <div class="export-dialog-control">
               <label for="export-name">File name:</label>
               <input id="export-name" class="export-dialog-name" class:invalid={!nameValid} type="text" bind:value={name} />
            </div>

            <div class="export-dialog-control">
               <label for="export-width">Size, cm: ({width} × {height})</label>
               <input id="export-width" type="range" min="4" max="20" step="1" value={width} oninput={handleWidthChange} />
            </div>

            <div class="export-dialog-res">
               <span class="export-dialog-res-label">Resolution, dpi:</span>
               <div class="export-dialog-res-options">
                  {#each resOptions as opt}
                     <label class="export-dialog-res-btn" class:selected={res === opt}>
                        <input type="radio" name="export-res" value={opt} bind:group={res} />
                        {opt}
                     </label>
                  {/each}
               </div>
            </div>
         </div>
      </div>

      <div class="export-dialog-actions">
         <button type="button" class="export-dialog-cancel" onclick={onclose} disabled={saving}>Cancel</button>
         <button type="button" class="export-dialog-save" onclick={handleSave} disabled={!nameValid}>Save</button>
      </div>
   </div>
</div>

<style>
   .export-dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
   }

   .export-dialog {
      background: #fefefe;
      border-radius: 0.5em;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
      padding: 1.25em;
      min-width: 440px;
      max-width: 90vw;
      font-family: Arial, Helvetica, sans-serif;
      color: #606060;
   }

   .export-dialog-title {
      font-size: 1.1em;
      font-weight: bold;
      margin-bottom: 1em;
      color: #303030;
   }

   .export-dialog-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1em;
   }

   .export-dialog-preview {
      border: 1px solid #dadada;
      background: #fff;
      overflow: hidden;
      border-radius: 0.25em;
   }

   .export-dialog-controls {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
   }

   .export-dialog-control {
      display: flex;
      align-items: center;
      gap: 0.5em;
   }

   .export-dialog-control label {
      min-width: 110px;
      font-size: 0.85em;
      white-space: nowrap;
   }

   .export-dialog-control input[type="range"] {
      flex: 1;
      accent-color: #443333;
   }

   .export-dialog-name {
      flex: 1;
      padding: 0.25em 0.4em;
      border: 1px solid #dadada;
      border-radius: 0.35em;
      font-size: 0.85em;
      color: #606060;
      background: #fafafa;
      outline: none;
   }

   .export-dialog-name:focus {
      border-color: #909090;
   }

   .export-dialog-name.invalid {
      border-color: crimson;
   }

   .export-dialog-res {
      display: flex;
      align-items: center;
      gap: 0.5em;
   }

   .export-dialog-res-label {
      min-width: 110px;
      font-size: 0.85em;
      white-space: nowrap;
   }

   .export-dialog-res-options {
      display: flex;
      gap: 0.25em;
   }

   .export-dialog-res-btn {
      box-sizing: border-box;
      color: #606060;
      border: none;
      box-shadow: none;
      background: #fafafa;
      border-radius: 0.35em;
      padding: 0.25em 0.5em;
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
   }

   .export-dialog-res-btn:hover {
      background: #dadada;
   }

   .export-dialog-res-btn.selected {
      background: #443333;
      color: #fafafa;
   }

   .export-dialog-res-btn input {
      display: none;
   }

   .export-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5em;
      margin-top: 1em;
   }

   .export-dialog-actions button {
      padding: 0.4em 1.2em;
      border-radius: 0.35em;
      border: none;
      cursor: pointer;
      font-size: 0.85em;
   }

   .export-dialog-cancel {
      background: #fafafa;
      color: #606060;
   }

   .export-dialog-cancel:hover {
      background: #dadada;
   }

   .export-dialog-save {
      background: #443333;
      color: #fafafa;
   }

   .export-dialog-save:hover {
      background: #665555;
      color: #fafafa;
   }

   .export-dialog-save:disabled {
      background: #dadada;
      color: #909090;
      cursor: default;
   }
</style>
