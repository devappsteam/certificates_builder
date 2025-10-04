import './assets/main.css';
import Alpine from 'alpinejs';

document.addEventListener('alpine:init', () => {
  Alpine.data('artboard', () => ({
    zoom: 100,
    showGrid: false,
    showBleed: true,
    showSafe: true,
    activeMenu: 'elements',
    selectedElement: null,
    resizing: null,
    startResize: { x: 0, y: 0, width: 0, height: 0 },
    currentResizer: null,
    fontSelectorOpen: null,
    appliedFonts: new Set(),
    availableFonts: [],
    fontApiKey: 'AIzaSyAOPS8SX3QZg4GEsPAqKFwNw0Yv4_qCUcU', // Chave API do Google Fonts
    
    // Constantes para dimensões do artboard
    ARTBOARD_WIDTH: 1123,
    ARTBOARD_HEIGHT: 794,
    ARTBOARD_PADDING: 24, // Margem de segurança
    
    // Propriedades para drag and drop
    dragging: null,
    dragOffset: { x: 0, y: 0 },
    isDragging: false,

    items: [
      { type: 'text', label: 'Texto', editable: true },
      { type: 'course', label: 'Curso', editable: false },
      { type: 'instructor', label: 'Instrutor', editable: false },
      { type: 'dateTime', label: 'Data e Hora', editable: false },
      { type: 'signature', label: 'Assinatura', editable: false },
      { type: 'verification', label: 'Verificação ID', editable: false },
      { type: 'qrcode', label: 'QR Code', editable: false, style: { width: '120px', height: '120px' } },
      { type: 'grade', label: 'Grade', editable: false },
      { type: 'duration', label: 'Duração', editable: false },
      { type: 'student', label: 'Estudante', editable: false },
    ],

    defaultStyle: {
      fontSize: "1rem",
      fontWeight: "400",
      color: "#1f2937",
      lineHeight: 1.4,
      position: "absolute",
      left: "100px",
      top: "100px",
      minWidth: "100px",
      minHeight: "24px",
      userSelect: "none",
      transition: "all 0.2s ease",
      outline: "none",
      border: "none",
    },

    elements: [],

    decreaseZoom() {
      if (this.zoom > 25) {
        this.zoom -= 25;
      }
    },

    increaseZoom() {
      if (this.zoom < 200) {
        this.zoom += 25;
      }
    },

    fitToScreen() {
      this.zoom = 100;
    },

    get zoomStyle() {
      return `transform: scale(${this.zoom / 100})`;
    },

    toggleMenu(menu) {
      this.activeMenu = this.activeMenu === menu ? null : menu;
    },

    addElement(type) {
      const item = this.items.find(i => i.type === type);
      if (!item) return;

      this.elements.push({
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        type: item.type,
        editable: item.editable,
        locked: false,
        label: item.editable ? 'Novo texto' : `{{${item.type}}}`,
        value: item.editable ? 'Novo texto' : `{{${item.type}}}`,
        style: { ...(this.defaultStyle || {}), ...(item.style || {}) }
      });
    },

    updateContent(index, event) {
      if (!this.elements[index].editable) return;
      this.elements[index].value = event.target.innerText;
      this.elements[index].label = event.target.innerText;
    },

    deleteElement(index) {
      this.elements.splice(index, 1);
      this.selectedElement = null;
    },

    selectElement(index, event) {
      if (this.isDragging) return;
      if (event) event.stopPropagation();
      this.selectedElement = this.selectedElement === index ? null : index;
    },

    clearSelection() {
      this.selectedElement = null;
    },

    toggleLock(index) {
      if (!this.elements[index]) return;
      this.elements[index].locked = !this.elements[index].locked;
    },

    // Função para bloquear menu de contexto
    preventContextMenu(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    },

    handleKeyDown(index, event) {
      if (this.elements[index].locked) return;
      
      const step = event.shiftKey ? 10 : 1;
      let newStyle = { ...this.elements[index].style };
      
      switch(event.key) {
        case 'ArrowUp':
          event.preventDefault();
          newStyle.top = Math.max(0, parseInt(newStyle.top) - step) + 'px';
          break;
        case 'ArrowDown':
          event.preventDefault();
          newStyle.top = Math.min(this.ARTBOARD_HEIGHT - 50, parseInt(newStyle.top) + step) + 'px';
          break;
        case 'ArrowLeft':
          event.preventDefault();
          newStyle.left = Math.max(0, parseInt(newStyle.left) - step) + 'px';
          break;
        case 'ArrowRight':
          event.preventDefault();
          newStyle.left = Math.min(this.ARTBOARD_WIDTH - 100, parseInt(newStyle.left) + step) + 'px';
          break;
        case 'Delete':
        case 'Backspace':
          if (!this.elements[index].editable) {
            event.preventDefault();
            this.deleteElement(index);
          }
          break;
      }
      
      this.elements[index].style = newStyle;
    },

    // Função para iniciar o drag
    onMouseDown(index, event) {
      // Verifica se o elemento está bloqueado
      if (this.elements[index].locked) return;
      
      // Se for um clique em elemento editável, não arrasta
      if (event.target.contentEditable === 'true') return;
      
      // Só processa clique esquerdo (button 0)
      if (event.button !== 0) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      this.isDragging = true;
      this.dragging = index;
      this.selectedElement = index;
      
      const artboard = event.target.closest('[data-artboard]');
      const artboardRect = artboard.getBoundingClientRect();
      const elementWrapper = event.target.closest('.element-wrapper');
      const elementRect = elementWrapper.getBoundingClientRect();
      
      // Calcula o fator de zoom atual
      const zoomFactor = this.zoom / 100;
      
      // Calcula posições considerando o zoom
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = parseInt(this.elements[index].style.left) || 0;
      const startTop = parseInt(this.elements[index].style.top) || 0;
      
      // Adiciona classe visual de arrastar
      elementWrapper.classList.add('dragging');
      
      const handleMouseMove = (e) => {
        if (!this.isDragging) return;
        
        // Calcula o delta considerando o zoom
        const deltaX = (e.clientX - startX) / zoomFactor;
        const deltaY = (e.clientY - startY) / zoomFactor;
        
        const newLeft = startLeft + deltaX;
        const newTop = startTop + deltaY;
        
        // Calcula os limites do artboard considerando o zoom e margens de segurança
        const minX = 0;
        const minY = 0;
        const maxX = (artboardRect.width / zoomFactor) - elementRect.width;
        const maxY = (artboardRect.height / zoomFactor) - elementRect.height;
        
        // Aplica restrições com limites atualizados
        const constrainedLeft = Math.max(minX, Math.min(newLeft, maxX));
        const constrainedTop = Math.max(minY, Math.min(newTop, maxY));
        
        // Atualiza posição com animação suave
        this.elements[index].style = {
          ...this.elements[index].style,
          left: `${constrainedLeft}px`,
          top: `${constrainedTop}px`,
          transition: 'none' // Remove transição durante o arrasto para movimento suave
        };
      };
      
      const handleMouseUp = () => {
        this.isDragging = false;
        this.dragging = null;
        
        // Restaura transição após soltar
        this.elements[index].style = {
          ...this.elements[index].style,
          transition: 'all 0.2s ease'
        };
        
        // Remove classe visual
        elementWrapper.classList.remove('dragging');
        
        // Remove listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      // Adiciona listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },

    startResizing(direction, event, index) {
      if (this.elements[index].locked) return;
      event.preventDefault();
      event.stopPropagation();

      this.resizing = true;
      this.currentResizer = direction;
      const element = event.target.closest('.element-wrapper');
      const rect = element.getBoundingClientRect();

      this.startResize = {
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      };

      const handleMouseMove = (e) => {
        if (!this.resizing) return;

        const dx = e.clientX - this.startResize.x;
        const dy = e.clientY - this.startResize.y;
        const newStyle = { ...this.elements[index].style };

        switch (this.currentResizer) {
          case 'e':
            newStyle.width = `${Math.max(100, this.startResize.width + dx)}px`;
            break;
          case 'w':
            newStyle.width = `${Math.max(100, this.startResize.width - dx)}px`;
            break;
          case 's':
            newStyle.height = `${Math.max(24, this.startResize.height + dy)}px`;
            break;
          case 'n':
            newStyle.height = `${Math.max(24, this.startResize.height - dy)}px`;
            break;
          case 'se':
            newStyle.width = `${Math.max(100, this.startResize.width + dx)}px`;
            newStyle.height = `${Math.max(24, this.startResize.height + dy)}px`;
            break;
          case 'sw':
            newStyle.width = `${Math.max(100, this.startResize.width - dx)}px`;
            newStyle.height = `${Math.max(24, this.startResize.height + dy)}px`;
            break;
          case 'ne':
            newStyle.width = `${Math.max(100, this.startResize.width + dx)}px`;
            newStyle.height = `${Math.max(24, this.startResize.height - dy)}px`;
            break;
          case 'nw':
            newStyle.width = `${Math.max(100, this.startResize.width - dx)}px`;
            newStyle.height = `${Math.max(24, this.startResize.height - dy)}px`;
            break;
        }

        this.elements[index].style = newStyle;
      };

      const handleMouseUp = () => {
        this.resizing = false;
        this.currentResizer = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },

    async loadGoogleFonts() {
      try {
        const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${this.fontApiKey}&sort=popularity`);
        const data = await response.json();
        this.availableFonts = data.items.slice(0, 50).map(font => ({
          family: font.family,
          variants: font.variants,
          files: font.files
        }));
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
        // Fallback para algumas fontes comuns open source
        this.availableFonts = [
          { family: 'Roboto', variants: ['regular', '700'] },
          { family: 'Open Sans', variants: ['regular', '700'] },
          { family: 'Lato', variants: ['regular', '700'] },
          { family: 'Source Sans Pro', variants: ['regular', '700'] }
        ];
      }
    },

    loadFont(fontFamily) {
      if (this.appliedFonts.has(fontFamily)) return;

      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      this.appliedFonts.add(fontFamily);
    },

    toggleFontSelector(index) {
      this.fontSelectorOpen = this.fontSelectorOpen === index ? null : index;
    },

    selectFont(index, font) {
      this.loadFont(font.family);
      this.elements[index].style = {
        ...this.elements[index].style,
        fontFamily: `'${font.family}', sans-serif`
      };
      this.fontSelectorOpen = null;
    },

    toggleBold(index) {
      const currentWeight = this.elements[index].style.fontWeight;
      this.elements[index].style = {
        ...this.elements[index].style,
        fontWeight: currentWeight === '700' ? '400' : '700'
      };
    },

    toggleItalic(index) {
      const currentStyle = this.elements[index].style.fontStyle;
      this.elements[index].style = {
        ...this.elements[index].style,
        fontStyle: currentStyle === 'italic' ? 'normal' : 'italic'
      };
    },

    toggleUnderline(index) {
      const currentDecoration = this.elements[index].style.textDecoration;
      this.elements[index].style = {
        ...this.elements[index].style,
        textDecoration: currentDecoration === 'underline' ? 'none' : 'underline'
      };
    },

    cycleAlignment(index) {
      const alignments = ['left', 'center', 'right', 'justify'];
      const currentAlign = this.elements[index].style.textAlign || 'left';
      const currentIndex = alignments.indexOf(currentAlign);
      const nextIndex = (currentIndex + 1) % alignments.length;
      
      this.elements[index].style = {
        ...this.elements[index].style,
        textAlign: alignments[nextIndex]
      };
    },

    updateTextColor(index, event) {
      this.elements[index].style = {
        ...this.elements[index].style,
        color: event.target.value
      };
    },

    init() {
      console.log('Alpine component initialized');
      this.loadGoogleFonts();
      
      // Limpar seleção quando clicar fora
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.element-wrapper') && !this.isDragging) {
          this.clearSelection();
        }
      });

      // Adicionar suporte a teclado para elementos selecionados
      document.addEventListener('keydown', (e) => {
        if (this.selectedElement !== null && !this.isDragging) {
          this.handleKeyDown(this.selectedElement, e);
        }
      });

      // Bloquear menu de contexto em toda a área do artboard
      const artboard = document.querySelector('[data-artboard]');
      if (artboard) {
        artboard.addEventListener('contextmenu', this.preventContextMenu);
      }
    }
  }));
});

window.Alpine = Alpine;
Alpine.start();