import { defineStore } from "pinia";

export type TextAlign = "left" | "center" | "right" | "justify";
export type ElementType = "text" | "image" | "shape" | "qr" | "barcode";

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: string; // 'normal' | 'bold' | '700'
  fontStyle?: string; // 'normal' | 'italic'
  textDecoration?: string; // 'none' | 'underline'
  textAlign?: TextAlign;
  letterSpacing?: number; // px
  lineHeight?: number; // unitless or px
  color?: string; // hex
  bgColor?: string;
  opacity?: number; // 0..1
  borderColor?: string;
  borderWidth?: number; // px
  borderRadius?: number; // px
  shadow?: string;
}

export interface BuilderElement {
  id: string;
  type: ElementType;
  content?: string; // texto, url imagem, payload para qr/barcode
  x: number; // px (base A4 @96dpi por ora)
  y: number; // px
  width?: number; // px
  height?: number; // px
  rotation?: number; // deg
  locked?: boolean;
  style: ElementStyle;
}

export interface Page {
  id: string;
  name: string;
  width: number; // px (A4 retrato: 794 x 1123 @96dpi; paisagem: 1123 x 794)
  height: number;
  backgroundColor?: string;
  backgroundImage?: string;
  elements: BuilderElement[];
}

export interface Project {
  id: string;
  name: string;
  pages: Page[]; // frente/verso no MVP
  orientation: "portrait" | "landscape";
}

export const A4 = {
  portrait: { width: 794, height: 1123 }, // 210x297 mm @ ~96dpi
  landscape: { width: 1123, height: 794 },
} as const;

export const useEditorStore = defineStore("editor", {
  state: () => ({
    project: {
      id: "cert-01",
      name: "Certificado 01",
      orientation: "landscape",
      pages: [
        {
          id: "page-front",
          name: "Frente",
          width: A4.landscape.width,
          height: A4.landscape.height,
          backgroundColor: "#ffffff",
          elements: [],
        },
        {
          id: "page-back",
          name: "Verso",
          width: A4.landscape.width,
          height: A4.landscape.height,
          backgroundColor: "#ffffff",
          elements: [],
        },
      ],
    } as Project,
    ui: {
      activePageId: "page-front" as string,
      activeElementId: null as string | null,
      zoom: 1,
      fitToScreen: true,
      showGrid: false,
      showBleed: true,
      showSafe: true,
      isTextToolbarVisible: false,
      toolbarX: 0,
      toolbarY: 0,
      subOpen: true,
      // NOVO: controla se o toolbar foi aberto via botão de editar
      toolbarOpenedByButton: false,
    },
  }),

  getters: {
    activePage(state): Page | undefined {
      return state.project.pages.find((p) => p.id === state.ui.activePageId);
    },
    activeElement(state): BuilderElement | undefined {
      const page = (this as any).activePage as Page | undefined;
      if (!page || !state.ui.activeElementId) return undefined;
      return page.elements.find((e) => e.id === state.ui.activeElementId);
    },
  },
  actions: {
    setActivePage(id: string) {
      this.ui.activePageId = id;
      this.ui.activeElementId = null;
      this.ui.isTextToolbarVisible = false;
    },
    setActiveElement(
      id: string | null,
      toolbarX?: number,
      toolbarY?: number,
      openToolbar = false
    ) {
      this.ui.activeElementId = id;

      // MODIFICADO: só mostra toolbar se foi explicitamente solicitado
      if (openToolbar && id) {
        const el = this.activeElement;
        this.ui.isTextToolbarVisible = !!(el && el.type === "text");
        this.ui.toolbarOpenedByButton = true;
      } else {
        this.ui.isTextToolbarVisible = false;
        this.ui.toolbarOpenedByButton = false;
      }

      if (toolbarX !== undefined && toolbarY !== undefined) {
        this.ui.toolbarX = toolbarX;
        this.ui.toolbarY = toolbarY;
      }
    },
    closeToolbar() {
      this.ui.isTextToolbarVisible = false;
      this.ui.toolbarOpenedByButton = false;
    },
    updateElementPosition(elementId: string, x: number, y: number) {
      const page = this.activePage;
      if (!page) return;

      const element = page.elements.find((el) => el.id === elementId);
      if (element) {
        element.x = x;
        element.y = y;
      }
    },
    updateElementStyle(elementId: string, style: Partial<ElementStyle>) {
      const page = this.activePage;
      if (!page) return;
      const el = page.elements.find((e) => e.id === elementId);
      if (el) Object.assign(el.style, style);
    },
    updateElementContent(elementId: string, content: string) {
      const page = this.activePage;
      if (!page) return;
      const el = page.elements.find((e) => e.id === elementId);
      if (el) el.content = content;
    },
    updateElementSize(
      elementId: string,
      width: number,
      height: number,
      x?: number,
      y?: number
    ) {
      const page = this.activePage;
      if (!page) return;

      const element = page.elements.find((el) => el.id === elementId);
      if (element) {
        element.width = width;
        element.height = height;
        if (x !== undefined) element.x = x;
        if (y !== undefined) element.y = y;
      }
    },
    toggleBold() {
      const el = this.activeElement;
      if (!el || el.type !== "text") return;
      el.style.fontWeight =
        el.style.fontWeight === "700" || el.style.fontWeight === "bold"
          ? "400"
          : "700";
    },
    toggleItalic() {
      const el = this.activeElement;
      if (!el || el.type !== "text") return;
      el.style.fontStyle =
        el.style.fontStyle === "italic" ? "normal" : "italic";
    },
    toggleUnderline() {
      const el = this.activeElement;
      if (!el || el.type !== "text") return;
      el.style.textDecoration =
        el.style.textDecoration === "underline" ? "none" : "underline";
    },
    setTextAlign(align: TextAlign) {
      const el = this.activeElement;
      if (!el || el.type !== "text") return;
      el.style.textAlign = align;
    },
    setZoom(zoom: number) {
      this.ui.zoom = Math.max(0.1, Math.min(zoom, 4));
      this.ui.fitToScreen = false;
    },
    setFitToScreen(val: boolean) {
      this.ui.fitToScreen = val;
    },

    updateElementContent(id: string, content: string) {
      const element = this.elements.find((el) => el.id === id);
      if (element) {
        element.content = content;
      }
    },

    updateContent(elementId: string, content: string) {
      const page = this.activePage;
      if (!page) return;

      const element = page.elements.find((el) => el.id === elementId);
      if (element) {
        element.content = content;
      }
    },

    addElement(type: ElementType, options: Partial<BuilderElement> = {}) {
      const page = this.activePage;
      if (!page) return;

      const defaultStyle: ElementStyle = {
        fontFamily: "Roboto",
        fontSize: 16,
        fontWeight: "400",
        color: "#1f2937",
        lineHeight: 1.4,
      };

      const defaults: Record<ElementType, Partial<BuilderElement>> = {
        text: {
          type: "text",
          content: "Novo texto",
          x: 400,
          y: 200,
          width: 200,
          height: 40, // ADICIONADO height padrão
          style: defaultStyle,
        },
        image: {
          type: "image",
          x: 400,
          y: 200,
          width: 200,
          height: 200,
          style: {},
        },
        shape: {
          type: "shape",
          x: 400,
          y: 200,
          width: 200,
          height: 100,
          style: {
            bgColor: "#e5e7eb",
            borderRadius: 4,
          },
        },
        qr: {
          type: "qr",
          content: "https://",
          x: 400,
          y: 200,
          width: 120,
          height: 120,
          style: {},
        },
        barcode: {
          type: "barcode",
          content: "123456789",
          x: 400,
          y: 200,
          width: 200,
          height: 100,
          style: {},
        },
      };

      const element: BuilderElement = {
        id: "el-" + Date.now(),
        type,
        x: 0,
        y: 0,
        ...defaults[type],
        ...options,
        style: { ...(defaults[type].style || {}), ...(options.style || {}) },
      };

      page.elements.push(element);
      this.setActiveElement(element.id); // ADICIONADO: seleciona automaticamente
    },
  },
});
