<script setup lang="ts">
import { useEditorStore } from '../stores/editor';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const editor = useEditorStore();
</script>

<template>
  <header class="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-2">
      <img src="https://devapps.com.br/assets/images/logo.png" alt="logo" class="h-8 brightness-0" />
    </div>
    <div class="text-slate-600">
      {{ editor.project.name }}
    </div>
    <div class="flex items-center gap-2">
      <button class="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50">Visualizar</button>
      <button class="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">Salvar</button>
      <button class="p-2 hover:bg-slate-100 rounded" title="Close">
        <XMarkIcon class="h-6 w-6 text-slate-700" />
      </button>
    </div>
  </header>
</template>