<script setup lang="ts">
import { ref, computed } from 'vue';
import { PencilIcon } from '@heroicons/vue/24/outline';
import { useEditorStore, type BuilderElement } from '../stores/editor';

interface Props {
  element: BuilderElement;
  scale: number;
}

const props = defineProps<Props>();

const editor = useEditorStore();

// Estados para resize
const isResizing = ref(false);
const resizeHandle = ref<string | null>(null);
const resizeStartPos = ref({ x: 0, y: 0 });
const resizeStartSize = ref({ width: 0, height: 0 });
const resizeStartElementPos = ref({ x: 0, y: 0 });

const elementWidth = computed(() => props.element.width || 200);
const elementHeight = computed(() => props.element.height || 40);

const controlsStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${props.element.x - 4}px`,
  top: `${props.element.y - 4}px`,
  width: `${elementWidth.value + 8}px`,
  height: `${elementHeight.value + 8}px`,
  pointerEvents: 'none' as const,
  zIndex: 1000,
}));

const handles = [
  { name: 'nw', cursor: 'nw-resize', x: -4, y: -4 },
  { name: 'n', cursor: 'n-resize', x: '50%', y: -4, transform: 'translateX(-50%)' },
  { name: 'ne', cursor: 'ne-resize', x: '100%', y: -4, transform: 'translateX(-100%)' },
  { name: 'e', cursor: 'e-resize', x: '100%', y: '50%', transform: 'translate(-100%, -50%)' },
  { name: 'se', cursor: 'se-resize', x: '100%', y: '100%', transform: 'translate(-100%, -100%)' },
  { name: 's', cursor: 's-resize', x: '50%', y: '100%', transform: 'translate(-50%, -100%)' },
  { name: 'sw', cursor: 'sw-resize', x: -4, y: '100%', transform: 'translateY(-100%)' },
  { name: 'w', cursor: 'w-resize', x: -4, y: '50%', transform: 'translateY(-50%)' },
];

function handleResizeStart(e: MouseEvent, handle: string) {
  e.preventDefault();
  e.stopPropagation();
  
  isResizing.value = true;
  resizeHandle.value = handle;
  resizeStartPos.value = { x: e.clientX, y: e.clientY };
  resizeStartSize.value = { 
    width: elementWidth.value, 
    height: elementHeight.value 
  };
  resizeStartElementPos.value = { x: props.element.x, y: props.element.y };
  
  // ADICIONADO: Fecha o toolbar durante o resize
  editor.closeToolbar();
  
  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeMove(e: MouseEvent) {
  if (!isResizing.value || !resizeHandle.value) return;
  
  const deltaX = (e.clientX - resizeStartPos.value.x) / props.scale;
  const deltaY = (e.clientY - resizeStartPos.value.y) / props.scale;
  
  let newWidth = resizeStartSize.value.width;
  let newHeight = resizeStartSize.value.height;
  let newX = resizeStartElementPos.value.x;
  let newY = resizeStartElementPos.value.y;
  
  const minSize = 20;
  
  switch (resizeHandle.value) {
    case 'nw':
      newWidth = Math.max(minSize, resizeStartSize.value.width - deltaX);
      newHeight = Math.max(minSize, resizeStartSize.value.height - deltaY);
      newX = resizeStartElementPos.value.x + (resizeStartSize.value.width - newWidth);
      newY = resizeStartElementPos.value.y + (resizeStartSize.value.height - newHeight);
      break;
    case 'n':
      newHeight = Math.max(minSize, resizeStartSize.value.height - deltaY);
      newY = resizeStartElementPos.value.y + (resizeStartSize.value.height - newHeight);
      break;
    case 'ne':
      newWidth = Math.max(minSize, resizeStartSize.value.width + deltaX);
      newHeight = Math.max(minSize, resizeStartSize.value.height - deltaY);
      newY = resizeStartElementPos.value.y + (resizeStartSize.value.height - newHeight);
      break;
    case 'e':
      newWidth = Math.max(minSize, resizeStartSize.value.width + deltaX);
      break;
    case 'se':
      newWidth = Math.max(minSize, resizeStartSize.value.width + deltaX);
      newHeight = Math.max(minSize, resizeStartSize.value.height + deltaY);
      break;
    case 's':
      newHeight = Math.max(minSize, resizeStartSize.value.height + deltaY);
      break;
    case 'sw':
      newWidth = Math.max(minSize, resizeStartSize.value.width - deltaX);
      newHeight = Math.max(minSize, resizeStartSize.value.height + deltaY);
      newX = resizeStartElementPos.value.x + (resizeStartSize.value.width - newWidth);
      break;
    case 'w':
      newWidth = Math.max(minSize, resizeStartSize.value.width - deltaX);
      newX = resizeStartElementPos.value.x + (resizeStartSize.value.width - newWidth);
      break;
  }
  
  editor.updateElementSize(props.element.id, newWidth, newHeight, newX, newY);
}

function handleResizeEnd() {
  isResizing.value = false;
  resizeHandle.value = null;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
}

function handleEditClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  
  const toolbarWidth = 450;
  const padding = 12;
  
  // Posiciona o toolbar próximo ao elemento
  const elementCenterX = props.element.x + elementWidth.value / 2;
  let x = elementCenterX - toolbarWidth / 2;
  x = Math.max(padding, x);
  
  const y = props.element.y + elementHeight.value + 20;
  
  // MODIFICADO: usa o novo parâmetro openToolbar
  editor.setActiveElement(props.element.id, x, y, true);
}
</script>

<template>
  <div :style="controlsStyle">
    <!-- Borda de seleção -->
    <div class="absolute inset-0 border-2 border-blue-500 pointer-events-none bg-blue-500 bg-opacity-5"></div>
    
    <!-- Handles de resize -->
    <div
      v-for="handle in handles"
      :key="handle.name"
      class="absolute w-3 h-3 bg-blue-500 border-2 border-white pointer-events-auto hover:bg-blue-600 transition-colors rounded-sm shadow-sm"
      :style="{
        left: typeof handle.x === 'string' ? handle.x : `${handle.x}px`,
        top: typeof handle.y === 'string' ? handle.y : `${handle.y}px`,
        transform: handle.transform || 'none',
        cursor: handle.cursor,
      }"
      @mousedown="(e) => handleResizeStart(e, handle.name)"
    ></div>
    
    <!-- Ícone de edição no canto superior direito -->
    <button
      class="absolute w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center pointer-events-auto transition-colors shadow-lg border-2 border-white"
      :style="{
        right: '-14px',
        top: '-14px',
      }"
      @click="handleEditClick"
      title="Editar elemento"
    >
      <PencilIcon class="w-4 h-4" />
    </button>
  </div>
</template>