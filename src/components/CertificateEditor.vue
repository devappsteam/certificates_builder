<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore, type BuilderElement } from '../stores/editor';
import FloatingTextToolbar from './FloatingTextToolbar.vue';
import GridOverlay from './GridOverlay.vue';
import ElementControls from './ElementControls.vue';

const editInputRef = ref<HTMLInputElement | null>(null);

const editor = useEditorStore();
const stageRef = ref<HTMLElement | null>(null);
const scale = ref(1);

// Estados para drag & drop
const isDragging = ref(false);
const dragElement = ref<BuilderElement | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

const activePage = computed(() => editor.activePage);
const activeElementId = computed(() => editor.ui.activeElementId);
const activeElement = computed(() => editor.activeElement);

const fitToScreen = () => {
  if (!stageRef.value || !activePage.value) return;
  const container = stageRef.value.getBoundingClientRect();
  const pad = 40;
  const usableW = container.width - pad * 2;
  const usableH = container.height - pad * 2;
  const sX = usableW / activePage.value.width;
  const sY = usableH / activePage.value.height;
  scale.value = Math.min(sX, sY, 1);
};

// Funções de drag & drop
function handleMouseDown(e: MouseEvent, el: BuilderElement) {
  e.preventDefault();
  e.stopPropagation();
  
  isDragging.value = true;
  dragElement.value = el;
  
  const artboard = stageRef.value?.querySelector('[data-artboard]') as HTMLElement;
  const artboardRect = artboard?.getBoundingClientRect();
  
  if (artboardRect) {
    dragOffset.value = {
      x: (e.clientX - artboardRect.left) / scale.value - el.x,
      y: (e.clientY - artboardRect.top) / scale.value - el.y
    };
  }
  
  // MODIFICADO: seleciona sem abrir toolbar
  editor.setActiveElement(el.id);
  
  // ADICIONADO: Fecha o toolbar durante o drag
  editor.closeToolbar();
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value || !dragElement.value) return;
  
  const artboard = stageRef.value?.querySelector('[data-artboard]') as HTMLElement;
  const artboardRect = artboard?.getBoundingClientRect();
  
  if (artboardRect) {
    const newX = (e.clientX - artboardRect.left) / scale.value - dragOffset.value.x;
    const newY = (e.clientY - artboardRect.top) / scale.value - dragOffset.value.y;
    
    const maxX = activePage.value!.width - (dragElement.value.width || 0);
    const maxY = activePage.value!.height - (dragElement.value.height || 0);
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    editor.updateElementPosition(dragElement.value.id, constrainedX, constrainedY);
  }
}

function handleMouseUp() {
  isDragging.value = false;
  dragElement.value = null;
}

onMounted(() => {
  window.addEventListener('resize', fitToScreen);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  if (editor.ui.fitToScreen) fitToScreen();
});

onUnmounted(() => {
  window.removeEventListener('resize', fitToScreen);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});

const artboardStyle = computed(() => {
  const p = activePage.value;
  if (!p) return {};
  return {
    width: `${p.width}px`,
    height: `${p.height}px`,
    backgroundColor: p.backgroundColor || '#ffffff',
    transform: `scale(${scale.value})`,
    transformOrigin: 'top left',
    position: 'relative' as const,
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
  };
});

// MODIFICADO: Limpa seleção e fecha toolbar
function canvasClick() {
  if (!isDragging.value) {
    editor.setActiveElement(null);
    editor.closeToolbar();
  }
}

const elementEditing = ref<string | null>(null);
const editContent = ref('');

function handleEditClick(el: BuilderElement) {
  if (el.type !== 'text') return;
  elementEditing.value = el.id;
  editContent.value = el.content || '';
  editor.setActiveElement(el.id);
  
  setTimeout(() => {
    if (editInputRef.value) {
      editInputRef.value.focus();
    }
  }, 100);
}

function saveElementContent() {
  if (!elementEditing.value) return;
  editor.updateContent(elementEditing.value, editContent.value);
  elementEditing.value = null;
}

// MODIFICADO: Simplificada - apenas seleciona elemento
function elementClick(e: MouseEvent, el: BuilderElement) {
  e.stopPropagation();
  
  // MODIFICADO: Sempre seleciona sem abrir toolbar
  editor.setActiveElement(el.id);
  
  // Se for texto e duplo clique, ativa edição inline
  if (el.type === 'text' && e.detail === 2) {
    handleEditClick(el);
  }
}

function textStyle(el: BuilderElement): Record<string, any> {
  const s = el.style;
  return {
    position: 'absolute' as const,
    left: `${el.x}px`,
    top: `${el.y}px`,
    width: `${el.width || 200}px`,
    height: `${el.height || 40}px`,
    fontFamily: s.fontFamily || 'sans-serif',
    fontSize: `${(s.fontSize ?? 16)}px`,
    fontWeight: s.fontWeight || '400',
    fontStyle: s.fontStyle || 'normal',
    textDecoration: s.textDecoration || 'none',
    textAlign: s.textAlign || 'left',
    letterSpacing: `${(s.letterSpacing ?? 0)}px`,
    lineHeight: (s.lineHeight ?? 1.4),
    color: s.color || '#111827',
    backgroundColor: s.bgColor || 'transparent',
    opacity: (s.opacity ?? 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    transform: el.rotation ? `rotate(${el.rotation}deg)` : 'none',
    transformOrigin: 'center',
    cursor: isDragging.value && dragElement.value?.id === el.id ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    minHeight: '20px',
  };
}
</script>

<template>
  <div ref="stageRef" class="relative w-full h-full overflow-auto bg-checkerboard" @click="canvasClick">
    <div class="w-full h-full flex items-center justify-center p-5 transition-all duration-500" :class="editor.ui.subOpen ? 'ps-72': ''">

      <div class="relative" :style="artboardStyle" data-artboard>
        <!-- Bleed e Safe (visuais) -->
        <div v-if="editor.ui.showBleed" class="absolute inset-0 pointer-events-none artboard-outline-bleed"></div>
        <div v-if="editor.ui.showSafe" class="absolute inset-6 pointer-events-none artboard-outline-safe"></div>
        <!-- Crop marks -->
        <div class="crop-mark tl"></div>
        <div class="crop-mark tr"></div>
        <div class="crop-mark bl"></div>
        <div class="crop-mark br"></div>

        <GridOverlay v-if="editor.ui.showGrid" class="absolute inset-0 pointer-events-none" :zoom="scale"/>

        <!-- Render dos elementos -->
        <template v-for="el in activePage?.elements" :key="el.id">
          <div 
            v-if="el.type === 'text'" 
            :style="textStyle(el)" 
            @mousedown="(e) => handleMouseDown(e, el)"
            @click="(e) => elementClick(e, el)"
          >
            <template v-if="elementEditing === el.id">
              <input
                type="text"
                ref="editInputRef"
                :value="editContent"
                @input="(e) => editContent = (e.target as HTMLInputElement).value"
                @blur="saveElementContent"
                @keyup.enter="saveElementContent"
                @keyup.esc="elementEditing = null"
                class="w-full h-full bg-transparent outline-none"
                :style="{
                  fontFamily: el.style.fontFamily,
                  fontSize: `${el.style.fontSize}px`,
                  fontWeight: el.style.fontWeight,
                  textAlign: el.style.textAlign || 'left'
                }"
              />
            </template>
            <template v-else>
              {{ el.content }}
            </template>
          </div>
          
          <img 
            v-else-if="el.type === 'image'" 
            :src="el.content" 
            :alt="el.id"
            :style="{
              position: 'absolute',
              left: `${el.x}px`, top: `${el.y}px`,
              width: `${el.width ?? 120}px`, height: `${el.height ?? 80}px`,
              objectFit: 'contain',
              cursor: isDragging.value && dragElement.value?.id === el.id ? 'grabbing' : 'grab',
              userSelect: 'none'
            }"
            @mousedown="(e) => handleMouseDown(e, el)"
            @click="(e) => elementClick(e, el)" 
          />
          
          <div 
            v-else-if="el.type === 'shape'"
            :style="{
              position: 'absolute',
              left: `${el.x}px`, top: `${el.y}px`,
              width: `${el.width ?? 200}px`, height: `${el.height ?? 60}px`,
              backgroundColor: el.style.bgColor || '#e5e7eb',
              border: `${el.style.borderWidth ?? 0}px solid ${el.style.borderColor || 'transparent'}`,
              borderRadius: `${el.style.borderRadius ?? 0}px`,
              boxShadow: el.style.shadow || 'none',
              opacity: el.style.opacity ?? 1,
              cursor: isDragging.value && dragElement.value?.id === el.id ? 'grabbing' : 'grab',
              userSelect: 'none'
            }"
            @mousedown="(e) => handleMouseDown(e, el)"
            @click="(e) => elementClick(e, el)"
          ></div>
        </template>

        <!-- MODIFICADO: Controles aparecem sempre que há elemento ativo (exceto durante edição inline) -->
        <ElementControls
          v-if="activeElement && !elementEditing"
          :element="activeElement"
          :scale="scale"
        />

        <!-- MODIFICADO: Toolbar só aparece quando explicitamente aberto -->
        <FloatingTextToolbar 
          v-if="editor.ui.isTextToolbarVisible && editor.ui.toolbarOpenedByButton && editor.activeElement?.type === 'text'" 
          :x="editor.ui.toolbarX" 
          :y="editor.ui.toolbarY" 
        />
      </div>
    </div>
  </div>
</template>