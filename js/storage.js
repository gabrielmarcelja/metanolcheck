/**
 * Módulo de Storage
 * Gerencia armazenamento local de dados (localStorage)
 */

const Storage = {
  // Chaves do localStorage
  KEYS: {
    REVIEWS: 'metanolcheck_reviews',
    DENUNCIAS: 'metanolcheck_denuncias',
    CACHE_CNPJ: 'metanolcheck_cache_cnpj',
    HISTORICO_BUSCAS: 'metanolcheck_historico',
    STATS: 'metanolcheck_stats'
  },

  /**
   * Salva dados no localStorage
   * @param {string} chave - Chave do item
   * @param {*} valor - Valor a ser armazenado
   */
  salvar(chave, valor) {
    try {
      const json = JSON.stringify(valor);
      localStorage.setItem(chave, json);
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
      return false;
    }
  },

  /**
   * Recupera dados do localStorage
   * @param {string} chave - Chave do item
   * @returns {*} - Valor recuperado ou null
   */
  recuperar(chave) {
    try {
      const json = localStorage.getItem(chave);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.error('Erro ao recuperar do localStorage:', e);
      return null;
    }
  },

  /**
   * Remove item do localStorage
   * @param {string} chave - Chave do item
   */
  remover(chave) {
    try {
      localStorage.removeItem(chave);
      return true;
    } catch (e) {
      console.error('Erro ao remover do localStorage:', e);
      return false;
    }
  },

  /**
   * Limpa todos os dados do app
   */
  limparTudo() {
    try {
      Object.values(this.KEYS).forEach(chave => {
        localStorage.removeItem(chave);
      });
      return true;
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e);
      return false;
    }
  },

  // ========== REVIEWS ==========

  /**
   * Salva review de um estabelecimento
   * @param {string} cnpj - CNPJ do estabelecimento
   * @param {Object} review - Dados do review
   */
  salvarReview(cnpj, review) {
    const reviews = this.recuperar(this.KEYS.REVIEWS) || {};

    if (!reviews[cnpj]) {
      reviews[cnpj] = [];
    }

    const novoReview = {
      id: this.gerarId(),
      data: new Date().toISOString(),
      ...review
    };

    reviews[cnpj].push(novoReview);
    this.salvar(this.KEYS.REVIEWS, reviews);
    this.atualizarEstatisticas();

    return novoReview;
  },

  /**
   * Recupera reviews de um estabelecimento
   * @param {string} cnpj - CNPJ do estabelecimento
   * @returns {Array} - Lista de reviews
   */
  recuperarReviews(cnpj) {
    const reviews = this.recuperar(this.KEYS.REVIEWS) || {};
    return reviews[cnpj] || [];
  },

  /**
   * Recupera todos os reviews
   * @returns {Object} - Objeto com todos os reviews
   */
  recuperarTodosReviews() {
    return this.recuperar(this.KEYS.REVIEWS) || {};
  },

  /**
   * Calcula média das avaliações
   * @param {string} cnpj - CNPJ do estabelecimento
   * @returns {Object} - Estatísticas dos reviews
   */
  calcularEstatisticasReviews(cnpj) {
    const reviews = this.recuperarReviews(cnpj);

    if (reviews.length === 0) {
      return {
        total: 0,
        mediaLimpeza: 0,
        percentualGarrafasLacradas: 0,
        percentualNotaFiscal: 0,
        percentualPrecosNormais: 0
      };
    }

    const total = reviews.length;
    const somaLimpeza = reviews.reduce((acc, r) => acc + (r.limpeza || 0), 0);
    const garrafasLacradas = reviews.filter(r => r.garrafasLacradas === true).length;
    const notaFiscal = reviews.filter(r => r.notaFiscal === true).length;
    const precosNormais = reviews.filter(r => r.precosNormais === true).length;

    return {
      total,
      mediaLimpeza: (somaLimpeza / total).toFixed(1),
      percentualGarrafasLacradas: Math.round((garrafasLacradas / total) * 100),
      percentualNotaFiscal: Math.round((notaFiscal / total) * 100),
      percentualPrecosNormais: Math.round((precosNormais / total) * 100)
    };
  },

  /**
   * Remove um review específico
   * @param {string} cnpj - CNPJ do estabelecimento
   * @param {string} reviewId - ID do review
   */
  removerReview(cnpj, reviewId) {
    const reviews = this.recuperar(this.KEYS.REVIEWS) || {};

    if (reviews[cnpj]) {
      reviews[cnpj] = reviews[cnpj].filter(r => r.id !== reviewId);
      this.salvar(this.KEYS.REVIEWS, reviews);
      this.atualizarEstatisticas();
    }
  },

  // ========== DENÚNCIAS ==========

  /**
   * Salva denúncia de um estabelecimento
   * @param {string} cnpj - CNPJ do estabelecimento
   * @param {Object} denuncia - Dados da denúncia
   */
  salvarDenuncia(cnpj, denuncia) {
    const denuncias = this.recuperar(this.KEYS.DENUNCIAS) || {};

    if (!denuncias[cnpj]) {
      denuncias[cnpj] = [];
    }

    const novaDenuncia = {
      id: this.gerarId(),
      data: new Date().toISOString(),
      ...denuncia
    };

    denuncias[cnpj].push(novaDenuncia);
    this.salvar(this.KEYS.DENUNCIAS, denuncias);
    this.atualizarEstatisticas();

    return novaDenuncia;
  },

  /**
   * Recupera denúncias de um estabelecimento
   * @param {string} cnpj - CNPJ do estabelecimento
   * @returns {Array} - Lista de denúncias
   */
  recuperarDenuncias(cnpj) {
    const denuncias = this.recuperar(this.KEYS.DENUNCIAS) || {};
    return denuncias[cnpj] || [];
  },

  /**
   * Conta total de denúncias de um estabelecimento
   * @param {string} cnpj - CNPJ do estabelecimento
   * @returns {number} - Número de denúncias
   */
  contarDenuncias(cnpj) {
    return this.recuperarDenuncias(cnpj).length;
  },

  /**
   * Recupera todas as denúncias
   * @returns {Object} - Objeto com todas as denúncias
   */
  recuperarTodasDenuncias() {
    return this.recuperar(this.KEYS.DENUNCIAS) || {};
  },

  // ========== CACHE CNPJ ==========

  /**
   * Salva dados de CNPJ no cache
   * @param {string} cnpj - CNPJ do estabelecimento
   * @param {Object} dados - Dados da API
   */
  salvarCacheCNPJ(cnpj, dados) {
    const cache = this.recuperar(this.KEYS.CACHE_CNPJ) || {};

    cache[cnpj] = {
      dados: dados,
      timestamp: Date.now(),
      dataCache: new Date().toISOString()
    };

    this.salvar(this.KEYS.CACHE_CNPJ, cache);
  },

  /**
   * Recupera dados do cache de CNPJ
   * @param {string} cnpj - CNPJ do estabelecimento
   * @param {number} maxIdade - Idade máxima do cache em ms (padrão: 24h)
   * @returns {Object|null} - Dados em cache ou null
   */
  recuperarCacheCNPJ(cnpj, maxIdade = 24 * 60 * 60 * 1000) {
    const cache = this.recuperar(this.KEYS.CACHE_CNPJ) || {};
    const item = cache[cnpj];

    if (!item) {
      return null;
    }

    const idade = Date.now() - item.timestamp;

    if (idade > maxIdade) {
      // Cache expirado
      delete cache[cnpj];
      this.salvar(this.KEYS.CACHE_CNPJ, cache);
      return null;
    }

    return item.dados;
  },

  /**
   * Limpa cache de CNPJ expirado
   * @param {number} maxIdade - Idade máxima em ms
   */
  limparCacheExpirado(maxIdade = 24 * 60 * 60 * 1000) {
    const cache = this.recuperar(this.KEYS.CACHE_CNPJ) || {};
    const agora = Date.now();
    let removidos = 0;

    Object.keys(cache).forEach(cnpj => {
      const idade = agora - cache[cnpj].timestamp;
      if (idade > maxIdade) {
        delete cache[cnpj];
        removidos++;
      }
    });

    if (removidos > 0) {
      this.salvar(this.KEYS.CACHE_CNPJ, cache);
    }

    return removidos;
  },

  // ========== HISTÓRICO DE BUSCAS ==========

  /**
   * Adiciona busca ao histórico
   * @param {Object} busca - Dados da busca
   */
  adicionarHistorico(busca) {
    const historico = this.recuperar(this.KEYS.HISTORICO_BUSCAS) || [];

    const novaBusca = {
      id: this.gerarId(),
      timestamp: Date.now(),
      data: new Date().toISOString(),
      ...busca
    };

    historico.unshift(novaBusca);

    // Mantém apenas últimas 50 buscas
    const historicoLimitado = historico.slice(0, 50);
    this.salvar(this.KEYS.HISTORICO_BUSCAS, historicoLimitado);
  },

  /**
   * Recupera histórico de buscas
   * @param {number} limite - Número máximo de itens
   * @returns {Array} - Lista de buscas
   */
  recuperarHistorico(limite = 10) {
    const historico = this.recuperar(this.KEYS.HISTORICO_BUSCAS) || [];
    return historico.slice(0, limite);
  },

  /**
   * Limpa histórico de buscas
   */
  limparHistorico() {
    this.salvar(this.KEYS.HISTORICO_BUSCAS, []);
  },

  // ========== ESTATÍSTICAS ==========

  /**
   * Atualiza estatísticas gerais
   */
  atualizarEstatisticas() {
    const todosReviews = this.recuperarTodosReviews();
    const todasDenuncias = this.recuperarTodasDenuncias();

    // Conta total de estabelecimentos únicos
    const estabelecimentosComReviews = Object.keys(todosReviews);
    const estabelecimentosComDenuncias = Object.keys(todasDenuncias);
    const todosEstabelecimentos = new Set([
      ...estabelecimentosComReviews,
      ...estabelecimentosComDenuncias
    ]);

    // Conta total de reviews
    let totalReviews = 0;
    Object.values(todosReviews).forEach(reviews => {
      totalReviews += reviews.length;
    });

    // Conta total de denúncias
    let totalDenuncias = 0;
    Object.values(todasDenuncias).forEach(denuncias => {
      totalDenuncias += denuncias.length;
    });

    const stats = {
      totalEstabelecimentos: todosEstabelecimentos.size,
      totalReviews: totalReviews,
      totalDenuncias: totalDenuncias,
      ultimaAtualizacao: new Date().toISOString()
    };

    this.salvar(this.KEYS.STATS, stats);
    return stats;
  },

  /**
   * Recupera estatísticas gerais
   * @returns {Object} - Estatísticas
   */
  recuperarEstatisticas() {
    const stats = this.recuperar(this.KEYS.STATS);

    if (!stats) {
      return this.atualizarEstatisticas();
    }

    return stats;
  },

  // ========== UTILITÁRIOS ==========

  /**
   * Gera ID único
   * @returns {string} - ID único
   */
  gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },

  /**
   * Exporta todos os dados para JSON
   * @returns {Object} - Todos os dados
   */
  exportarDados() {
    return {
      reviews: this.recuperar(this.KEYS.REVIEWS) || {},
      denuncias: this.recuperar(this.KEYS.DENUNCIAS) || {},
      historico: this.recuperar(this.KEYS.HISTORICO_BUSCAS) || [],
      stats: this.recuperarEstatisticas(),
      dataExportacao: new Date().toISOString()
    };
  },

  /**
   * Importa dados de JSON
   * @param {Object} dados - Dados a importar
   */
  importarDados(dados) {
    try {
      if (dados.reviews) {
        this.salvar(this.KEYS.REVIEWS, dados.reviews);
      }
      if (dados.denuncias) {
        this.salvar(this.KEYS.DENUNCIAS, dados.denuncias);
      }
      if (dados.historico) {
        this.salvar(this.KEYS.HISTORICO_BUSCAS, dados.historico);
      }
      this.atualizarEstatisticas();
      return true;
    } catch (e) {
      console.error('Erro ao importar dados:', e);
      return false;
    }
  },

  /**
   * Verifica se localStorage está disponível
   * @returns {boolean} - True se disponível
   */
  verificarDisponibilidade() {
    try {
      const teste = '__storage_test__';
      localStorage.setItem(teste, teste);
      localStorage.removeItem(teste);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Calcula tamanho aproximado usado no localStorage
   * @returns {number} - Tamanho em bytes
   */
  calcularTamanhoUsado() {
    let tamanho = 0;
    Object.values(this.KEYS).forEach(chave => {
      const item = localStorage.getItem(chave);
      if (item) {
        tamanho += item.length * 2; // Aproximado (UTF-16)
      }
    });
    return tamanho;
  },

  /**
   * Formata tamanho em bytes para string legível
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} - String formatada
   */
  formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

// Limpa cache expirado ao carregar
Storage.limparCacheExpirado();

// Torna disponível globalmente
window.Storage = Storage;
