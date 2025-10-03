<script setup lang="ts">
import { ref } from 'vue'
import { 
  Squares2X2Icon, 
  PlusIcon, 
  PhotoIcon, 
  BookOpenIcon, 
  SwatchIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserIcon,
  UserGroupIcon,
  PencilIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  CalendarDaysIcon,
  ClockIcon,
  TableCellsIcon
} from '@heroicons/vue/24/outline'
import { useEditorStore } from '../stores/editor';

const editor = useEditorStore();

const nav = [
  { id: 'elements',  label: 'Elementos',  icon: PlusIcon },
  { id: 'templates', label: 'Modelos',    icon: Squares2X2Icon },
  { id: 'media',     label: 'Mídia',      icon: PhotoIcon },
  { id: 'library',   label: 'Biblioteca', icon: BookOpenIcon },
  { id: 'backdrops', label: 'Background', icon: SwatchIcon },
];

// mapeando cada item para label + ícone
const elements = [
  { label: 'Texto',          icon: DocumentTextIcon, type: 'text' as const },
  { label: 'Curso',          icon: AcademicCapIcon, type: 'text' as const },
  { label: 'Estudante',      icon: UserIcon, type: 'text' as const },
  { label: 'Instrutor',      icon: UserGroupIcon, type: 'text' as const },
  { label: 'Assinatura',     icon: PencilIcon, type: 'text' as const },
  { label: 'Verificação ID', icon: ShieldCheckIcon, type: 'text' as const },
  { label: 'QR',             icon: QrCodeIcon, type: 'qr' as const },
  { label: 'Data e Hora',    icon: CalendarDaysIcon, type: 'text' as const },
  { label: 'Duração',        icon: ClockIcon, type: 'text' as const },
  { label: 'Grade',          icon: TableCellsIcon, type: 'text' as const },
];

function handleElementAdd(el: typeof elements[number]) {
  let options = {};
  
  switch (el.label) {
    case 'Curso':
      options = { content: 'Nome do Curso', style: { fontSize: 24, fontWeight: '700' } };
      break;
    case 'Estudante':
      options = { content: 'Nome do Estudante', style: { fontSize: 32, fontWeight: '700', color: '#2563eb' } };
      break;
    case 'Instrutor':
      options = { content: 'Nome do Instrutor', style: { fontSize: 16 } };
      break;
    case 'Data e Hora':
      options = { content: new Date().toLocaleDateString('pt-BR'), style: { fontSize: 14 } };
      break;
    case 'Duração':
      options = { content: 'Carga Horária: 40h', style: { fontSize: 14 } };
      break;
    case 'QR':
      options = { content: 'https://exemplo.com/certificado/123' };
      break;
    default:
      options = { content: el.label };
  }

  editor.addElement(el.type, options);
}

const activeItem = ref<string | null>('elements');

function handleClick(itemId: string) {
  if (activeItem.value === itemId) {
    editor.ui.subOpen = !editor.ui.subOpen
  } else {
    activeItem.value = itemId
    editor.ui.subOpen = true
  }
}
</script>

<template>
  <div class="relative flex">
    <aside class="w-20 bg-panel-bg text-slate-200 h-full flex flex-col shadow-panel z-20">
      <nav class="my-6">
        <div class="flex w-full space-y-5 items-center flex-col">
          <button
            v-for="item in nav"
            :key="item.id"
            class="flex flex-col items-center gap-3 px-3 py-2 cursor-pointer w-full"
            :class="activeItem === item.id ? 'bg-slate-800 border-l-4 border-blue-600' : ''"
            @click="handleClick(item.id)"
          >
            <component :is="item.icon" class="size-7" />
            <span class="text-xs">{{ item.label }}</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- painel lateral -->
    <div
      class="absolute w-72 bg-slate-800 text-slate-200 h-full flex flex-col z-10 p-4 transition-all duration-500"
      :class="editor.ui.subOpen ? 'left-20' : '-left-72'"
    >
      <!-- conteúdo dinâmico -->
      <template v-if="activeItem === 'elements'">
        <h2 class="text-lg font-bold mb-4">Elementos</h2>
        <ul class="grid grid-cols-2 gap-2">
          <li
            v-for="el in elements"
            :key="el.label"
            class="flex flex-col items-center justify-center gap-2 px-3 py-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 h-28 border border-slate-600"
            @click="handleElementAdd(el)"
          >
            <component :is="el.icon" class="size-7 text-white" />
            <span class="text-sm">{{ el.label }}</span>
          </li>
        </ul>
      </template>

      <template v-else-if="activeItem === 'templates'">
        <h2 class="text-lg font-bold">Modelos</h2>
        <p class="text-sm mt-2">Lista de modelos disponíveis…</p>
      </template>

      <template v-else-if="activeItem === 'media'">
        <h2 class="text-lg font-bold">Mídia</h2>
        <p class="text-sm mt-2">Upload ou escolha arquivos…</p>
      </template>

      <template v-else-if="activeItem === 'library'">
        <h2 class="text-lg font-bold">Biblioteca</h2>
        <p class="text-sm mt-2">Itens salvos e reutilizáveis…</p>
      </template>

      <template v-else-if="activeItem === 'backdrops'">
        <h2 class="text-lg font-bold">Background</h2>
        <p class="text-sm mt-2">Escolha um plano de fundo…</p>
      </template>
    </div>
  </div>
</template>