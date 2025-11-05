/**
 * Módulo Principal
 * Funções globais e utilitários usados em todas as páginas
 */

const App = {
  /**
   * Inicializa a aplicação
   */
  init() {
    this.verificarStorage();
    this.configurarMenuMobile();
    this.destacarLinkAtivo();
  },

  /**
   * Verifica disponibilidade do localStorage
   */
  verificarStorage() {
    if (!Storage.verificarDisponibilidade()) {
      this.mostrarAlerta(
        'Seu navegador não suporta armazenamento local. Algumas funcionalidades podem não funcionar corretamente.',
        'warning'
      );
    }
  },

  /**
   * Configura menu mobile
   */
  configurarMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
      });

      // Fecha menu ao clicar em link
      const navLinks = nav.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('active');
        });
      });

      // Fecha menu ao clicar fora
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
          nav.classList.remove('active');
        }
      });
    }
  },

  /**
   * Destaca link ativo no menu
   */
  destacarLinkAtivo() {
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === paginaAtual || (paginaAtual === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  },

  /**
   * Mostra loading overlay
   */
  mostrarLoading() {
    let overlay = document.querySelector('.loading-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading"></div>';
      document.body.appendChild(overlay);
    }

    overlay.style.display = 'flex';
  },

  /**
   * Esconde loading overlay
   */
  esconderLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  },

  /**
   * Mostra alerta
   * @param {string} mensagem - Mensagem do alerta
   * @param {string} tipo - Tipo: success, warning, danger, info
   * @param {number} duracao - Duração em ms (0 = permanente)
   */
  mostrarAlerta(mensagem, tipo = 'info', duracao = 5000) {
    const container = document.querySelector('.container') || document.body;

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensagem;
    alerta.style.position = 'fixed';
    alerta.style.top = '80px';
    alerta.style.right = '20px';
    alerta.style.zIndex = '9999';
    alerta.style.maxWidth = '400px';
    alerta.style.animation = 'slideInRight 0.3s ease';

    container.appendChild(alerta);

    if (duracao > 0) {
      setTimeout(() => {
        alerta.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alerta.remove(), 300);
      }, duracao);
    }

    return alerta;
  },

  /**
   * Mostra modal customizado
   * @param {string} titulo - Título do modal
   * @param {string} conteudo - Conteúdo HTML
   * @param {Array} botoes - Array de objetos {texto, classe, callback}
   */
  mostrarModal(titulo, conteudo, botoes = []) {
    // Remove modal existente
    const modalExistente = document.querySelector('.modal-overlay');
    if (modalExistente) {
      modalExistente.remove();
    }

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;

    // Cria modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 24px;
      border-bottom: 2px solid #f1f5f9;
    `;
    header.innerHTML = `<h3 style="margin: 0;">${titulo}</h3>`;

    // Body
    const body = document.createElement('div');
    body.style.cssText = `padding: 24px;`;
    body.innerHTML = conteudo;

    // Footer com botões
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 24px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    if (botoes.length === 0) {
      botoes = [{ texto: 'Fechar', classe: 'btn-secondary', callback: () => overlay.remove() }];
    }

    botoes.forEach(botaoConfig => {
      const botao = document.createElement('button');
      botao.className = `btn ${botaoConfig.classe || 'btn-primary'}`;
      botao.textContent = botaoConfig.texto;
      botao.onclick = () => {
        if (botaoConfig.callback) {
          botaoConfig.callback();
        }
        overlay.remove();
      };
      footer.appendChild(botao);
    });

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fecha ao clicar fora
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    return overlay;
  },

  /**
   * Formata data para exibição
   * @param {string} dataISO - Data em formato ISO
   * @returns {string} - Data formatada
   */
  formatarData(dataISO) {
    if (!dataISO) return 'Data não disponível';

    const data = new Date(dataISO);

    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }

    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Formata data e hora para exibição
   * @param {string} dataISO - Data em formato ISO
   * @returns {string} - Data e hora formatadas
   */
  formatarDataHora(dataISO) {
    if (!dataISO) return 'Data não disponível';

    const data = new Date(dataISO);

    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }

    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formata número como moeda brasileira
   * @param {number} valor - Valor numérico
   * @returns {string} - Valor formatado
   */
  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  /**
   * Cria elemento de estrelas para avaliação
   * @param {number} nota - Nota de 1 a 5
   * @returns {string} - HTML das estrelas
   */
  criarEstrelas(nota) {
    let html = '<div class="stars">';

    for (let i = 1; i <= 5; i++) {
      if (i <= nota) {
        html += '★';
      } else {
        html += '☆';
      }
    }

    html += '</div>';
    return html;
  },

  /**
   * Debounce para inputs
   * @param {Function} func - Função a ser executada
   * @param {number} delay - Delay em ms
   * @returns {Function} - Função com debounce
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Copia texto para área de transferência
   * @param {string} texto - Texto a copiar
   * @returns {Promise<boolean>} - Sucesso ou falha
   */
  async copiarParaAreaTransferencia(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      this.mostrarAlerta('Copiado para área de transferência!', 'success', 2000);
      return true;
    } catch (err) {
      console.error('Erro ao copiar:', err);
      this.mostrarAlerta('Erro ao copiar texto', 'danger', 2000);
      return false;
    }
  },

  /**
   * Compartilha conteúdo (Web Share API)
   * @param {Object} dados - {title, text, url}
   * @returns {Promise<boolean>} - Sucesso ou falha
   */
  async compartilhar(dados) {
    if (!navigator.share) {
      // Fallback: copia URL
      await this.copiarParaAreaTransferencia(dados.url || window.location.href);
      return false;
    }

    try {
      await navigator.share(dados);
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
      return false;
    }
  },

  /**
   * Scroll suave para elemento
   * @param {string} seletor - Seletor CSS do elemento
   */
  scrollPara(seletor) {
    const elemento = document.querySelector(seletor);
    if (elemento) {
      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  },

  /**
   * Gera URL para página de resultado
   * @param {string} cnpj - CNPJ do estabelecimento
   * @returns {string} - URL completa
   */
  gerarUrlResultado(cnpj) {
    const cnpjLimpo = Validacao.limparCNPJ(cnpj);
    return `resultado.html?cnpj=${cnpjLimpo}`;
  },

  /**
   * Obtém parâmetro da URL
   * @param {string} nome - Nome do parâmetro
   * @returns {string|null} - Valor do parâmetro
   */
  obterParametroUrl(nome) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nome);
  },

  /**
   * Valida conexão com internet
   * @returns {boolean} - True se online
   */
  estaOnline() {
    return navigator.onLine;
  },

  /**
   * Registra evento de analytics (placeholder para futuro)
   * @param {string} categoria - Categoria do evento
   * @param {string} acao - Ação realizada
   * @param {string} label - Label opcional
   */
  registrarEvento(categoria, acao, label = '') {
    // Placeholder para integração futura com analytics
    console.log('Evento:', { categoria, acao, label });
  },

  /**
   * Sanitiza HTML para prevenir XSS
   * @param {string} html - HTML a ser sanitizado
   * @returns {string} - HTML seguro
   */
  sanitizarHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Trunca texto longo
   * @param {string} texto - Texto a truncar
   * @param {number} limite - Limite de caracteres
   * @returns {string} - Texto truncado
   */
  truncarTexto(texto, limite = 100) {
    if (!texto || texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  },

  /**
   * Gera ID único simples
   * @returns {string} - ID único
   */
  gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },

  /**
   * Exporta dados como JSON para download
   * @param {Object} dados - Dados a exportar
   * @param {string} nomeArquivo - Nome do arquivo
   */
  exportarJSON(dados, nomeArquivo = 'dados.json') {
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
  },

  /**
   * Renderiza template simples
   * @param {string} template - Template string com {{variaveis}}
   * @param {Object} dados - Dados para substituir
   * @returns {string} - Template renderizado
   */
  renderizarTemplate(template, dados) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return dados[key] !== undefined ? dados[key] : match;
    });
  }
};

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Monitora mudanças no status da conexão
window.addEventListener('online', () => {
  App.mostrarAlerta('Conexão restaurada!', 'success', 3000);
});

window.addEventListener('offline', () => {
  App.mostrarAlerta('Sem conexão com a internet', 'warning', 0);
});

// Torna disponível globalmente
window.App = App;
