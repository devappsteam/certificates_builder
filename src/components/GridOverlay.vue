<template>
  <div
    v-show="show"
    class="absolute inset-0 pointer-events-none"
    :style="gridStyle"
    aria-hidden="true"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  show?: boolean
  // Tamanho base da célula em px quando zoom = 1 (ex.: 8, 10, 12)
  gridSize?: number
  // Quantas células menores formam uma linha "major"
  subdivisions?: number
  // Zoom atual do canvas (escala), ex.: 1, 1.25, 0.75
  zoom?: number
  // Pan do canvas em px (coordenadas do mundo do canvas), antes da escala
  offsetX?: number
  offsetY?: number
  // Cores RGBA das linhas minor/major
  colorMinor?: string
  colorMajor?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  gridSize: 8,
  subdivisions: 5,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  colorMinor: 'rgba(99, 102, 241, 0.15)', // indigo-500 @ 15%
  colorMajor: 'rgba(99, 102, 241, 0.35)', // indigo-500 @ 35%
})

/**
 * A grade é desenhada com 4 camadas de repeating-linear-gradient:
 * 1) Minor vertical
 * 2) Minor horizontal
 * 3) Major vertical
 * 4) Major horizontal
 * O tamanho de cada célula considera o zoom para "grudar" nas coordenadas do canvas.
 */
const gridStyle = computed(() => {
  const zoom = props.zoom || 1
  const base = props.gridSize
  const minor = Math.max(1, Math.round(base * zoom)) // px do grid minor
  const major = Math.max(minor * props.subdivisions, 1) // px do grid major

  // Offset p/ alinhar a grade com o pan do canvas
  // Se o pan for aplicado no mesmo container que a escala, compensamos ambos:
  // background-position recebe (pan * zoom) mod o tamanho da célula
  const oxMinor = mod((props.offsetX || 0) * zoom, minor)
  const oyMinor = mod((props.offsetY || 0) * zoom, minor)
  const oxMajor = mod((props.offsetX || 0) * zoom, major)
  const oyMajor = mod((props.offsetY || 0) * zoom, major)

  // Largura das linhas (1px) permanece em pixel de tela; ajuste se quiser escalar a espessura
  const minorLine = props.colorMinor
  const majorLine = props.colorMajor

  const backgroundImage = [
    // Minor vertical
    `repeating-linear-gradient(90deg, ${minorLine} 0, ${minorLine} 1px, transparent 1px ${minor}px)`,
    // Minor horizontal
    `repeating-linear-gradient(180deg, ${minorLine} 0, ${minorLine} 1px, transparent 1px ${minor}px)`,
    // Major vertical
    `repeating-linear-gradient(90deg, transparent 0, transparent ${major - 1}px, ${majorLine} ${major - 1}px, ${majorLine} ${major}px)`,
    // Major horizontal
    `repeating-linear-gradient(180deg, transparent 0, transparent ${major - 1}px, ${majorLine} ${major - 1}px, ${majorLine} ${major}px)`,
  ].join(',')

  const backgroundSize = [
    `${minor}px ${minor}px`,
    `${minor}px ${minor}px`,
    `${major}px ${major}px`,
    `${major}px ${major}px`,
  ].join(',')

  const backgroundPosition = [
    `${oxMinor}px ${oyMinor}px`,
    `${oxMinor}px ${oyMinor}px`,
    `${oxMajor}px ${oyMajor}px`,
    `${oxMajor}px ${oyMajor}px`,
  ].join(',')

  return {
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    // define um sutil blend para não competir com o conteúdo
    mixBlendMode: 'multiply',
    // garante que fique acima do papel mas abaixo de guias/toolbars
    zIndex: 10,
  } as Record<string, string | number>
})

function mod(n: number, m: number) {
  if (m === 0) return 0
  const r = n % m
  return r < 0 ? r + m : r
}
</script>

<style scoped>
</style>