<script setup lang="ts">
import { useEditorStore } from '../stores/editor';

const editor = useEditorStore();

function zoomOut() { editor.setZoom(editor.ui.zoom - 0.1); }
function zoomIn() { editor.setZoom(editor.ui.zoom + 0.1); }
function fit() { editor.setFitToScreen(true); }
</script>

<template>
  <footer class="h-10 bg-white border-t border-slate-200 px-3 flex items-center justify-between text-sm">
    <div class="flex items-center gap-3">
      <div>Página: {{ editor.activePage?.name }}</div>
      <div>Tamanho: {{ editor.activePage?.width }}px × {{ editor.activePage?.height }}px (A4 landscape)</div>
    </div>
    <div class="flex items-center gap-2">
      <button class="px-2 py-1 border rounded hover:bg-slate-50" @click="zoomOut">-</button>
      <div class="w-16 text-center">{{ Math.round(editor.ui.zoom * 100) }}%</div>
      <button class="px-2 py-1 border rounded hover:bg-slate-50" @click="zoomIn">+</button>
      <button class="px-2 py-1 border rounded hover:bg-slate-50" @click="fit">Ajustar</button>
      <div class="ml-4 text-slate-500">Grade</div>
      <label class="inline-flex items-center gap-1">
        <input type="checkbox" class="mr-1 cursor-pointer" v-model="editor.ui.showGrid" />
      </label>
      <div class="ml-4 text-slate-500">Sangria</div>
      <label class="inline-flex items-center gap-1">
        <input type="checkbox" class="mr-1 cursor-pointer" v-model="editor.ui.showBleed" />
      </label>
      <div class="ml-4 text-slate-500">Segurança</div>
      <label class="inline-flex items-center gap-1">
        <input type="checkbox" class="mr-1 cursor-pointer" v-model="editor.ui.showSafe" />
      </label>
    </div>
  </footer>
</template>