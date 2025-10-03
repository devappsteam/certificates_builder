<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEditorStore } from '../stores/editor';
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/solid';
import { Bars3BottomLeftIcon, Bars3CenterLeftIcon, Bars3BottomRightIcon, Bars4Icon,
         PencilIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{ x: number; y: number }>();
const editor = useEditorStore();
const styleRef = computed(() => editor.activeElement?.style);

const isEditing = ref(false);
const editContent = ref('');
const editInput = ref<HTMLInputElement | null>(null);
const fontFamily = ref('PT Sans');
const fontSize = ref(16);
const letterSpacing = ref(0);
const lineHeight = ref(1.4);

function startEditing() {
  if (!editor.activeElement) return;
  isEditing.value = true;
  editContent.value = editor.activeElement.content || '';
  
  // Foca no input depois que ele é renderizado
  setTimeout(() => {
    editInput.value?.focus();
  }, 100);
}

function saveContent() {
  if (!editor.ui.activeElementId) return;
  editor.updateContent(editor.ui.activeElementId, editContent.value);
  isEditing.value = false;
}

watch(styleRef, (s) => {
  if (!s) return;
  fontFamily.value = s.fontFamily ?? 'PT Sans';
  fontSize.value = s.fontSize ?? 16;
  letterSpacing.value = s.letterSpacing ?? 0;
  lineHeight.value = s.lineHeight ?? 1.4;
}, { immediate: true });

function update(key: 'fontFamily' | 'fontSize' | 'letterSpacing' | 'lineHeight', v: any) {
  const id = editor.ui.activeElementId;
  if (!id) return;
  editor.updateElementStyle(id, { [key]: v } as any);
}
</script>

<template>
  <div class="absolute z-20 bg-slate-900 text-white rounded-md shadow-lg p-3 min-w-[450px]"
       :style="{ left: `${props.x}px`, top: `${props.y}px` }"
       @click.stop>
    <div class="flex items-center gap-2 mb-2">
      <input class="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
             placeholder="Font family (ex: PT Sans)"
             v-model="fontFamily" @change="update('fontFamily', fontFamily)" />
      <div class="flex items-center gap-1">
        <button class="p-1 rounded bg-slate-800 hover:bg-slate-700" @click="fontSize = Math.max(1, fontSize-1); update('fontSize', fontSize)">
          <MinusIcon class="h-4 w-4" />
        </button>
        <input class="w-12 text-center bg-slate-800 border border-slate-700 rounded py-1 text-sm"
               type="number" v-model.number="fontSize" @input="update('fontSize', fontSize)" />
        <button class="p-1 rounded bg-slate-800 hover:bg-slate-700" @click="fontSize = fontSize+1; update('fontSize', fontSize)">
          <PlusIcon class="h-4 w-4" />
        </button>
      </div>
      <span class="text-xs text-slate-400">px</span>
    </div>

    <div class="grid grid-cols-2 gap-2 mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 w-24">Letter spacing</span>
        <input type="range" min="0" max="100" v-model.number="letterSpacing"
               @input="update('letterSpacing', letterSpacing)"
               class="flex-1 accent-indigo-500" />
        <span class="text-sm w-8 text-right">{{ letterSpacing }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 w-24">Line height</span>
        <input type="range" min="0.8" max="3" step="0.1" v-model.number="lineHeight"
               @input="update('lineHeight', lineHeight)"
               class="flex-1 accent-indigo-500" />
        <span class="text-sm w-8 text-right">{{ lineHeight.toFixed(1) }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm" @click="editor.toggleBold()">B</button>
        <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm italic" @click="editor.toggleItalic()">I</button>
        <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm underline" @click="editor.toggleUnderline()">U</button>
      </div>
      <div class="flex items-center gap-1">
        <button class="p-1 rounded bg-slate-800 hover:bg-slate-700"
                @click="editor.setTextAlign('left')">
          <Bars3BottomLeftIcon class="h-5 w-5" />
        </button>
        <button class="p-1 rounded bg-slate-800 hover:bg-slate-700"
                @click="editor.setTextAlign('center')">
          <Bars3CenterLeftIcon class="h-5 w-5" />
        </button>
        <button class="p-1 rounded bg-slate-800 hover:bg-slate-700"
                @click="editor.setTextAlign('right')">
          <Bars3BottomRightIcon class="h-5 w-5" />
        </button>
        <button class="p-1 rounded bg-slate-800 hover:bg-slate-700"
                @click="editor.setTextAlign('justify')">
          <Bars4Icon class="h-5 w-5" />
        </button>
      </div>
      <div v-if="isEditing" class="flex items-center gap-1">
        <input 
          class="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
          v-model="editContent"
          @keyup.enter="saveContent"
          @keyup.esc="isEditing = false"
          ref="editInput"
        />
        <button 
          class="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-sm"
          @click="saveContent"
        >
          Save
        </button>
      </div>
      <button 
        v-else
        class="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-sm flex items-center gap-1"
        @click="startEditing"
      >
        <PencilIcon class="h-4 w-4" /> Edit text
      </button>
    </div>
  </div>
</template>