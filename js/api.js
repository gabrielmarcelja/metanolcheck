/**
 * Módulo de API
 * Gerencia chamadas para APIs externas
 */

const API = {
  // URLs das APIs
  URLS: {
    CNPJA: 'https://api.cnpja.com/office',
    RECEITAWS: 'https://receitaws.com.br/v1/cnpj',
    BRASILAPI: 'https://brasilapi.com.br/api/cnpj/v1',
    VIACEP: 'https://viacep.com.br/ws'
  },

  // Timeout padrão (10 segundos)
  TIMEOUT: 10000,

  /**
   * Faz requisição HTTP com timeout
   * @param {string} url - URL da requisição
   * @param {Object} options - Opções do fetch
   * @returns {Promise} - Resposta da requisição
   */
  async fetchComTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito para responder');
      }
      throw error;
    }
  },

  // ========== API CNPJá ==========

  /**
   * Consulta dados de CNPJ - Tenta múltiplas APIs em cascata
   * @param {string} cnpj - CNPJ a consultar (com ou sem formatação)
   * @returns {Promise<Object>} - Dados do estabelecimento
   */
  async consultarCNPJ(cnpj) {
    try {
      // Remove formatação do CNPJ
      const cnpjLimpo = Validacao.limparCNPJ(cnpj);

      // Valida CNPJ
      if (!Validacao.validarCNPJ(cnpjLimpo)) {
        throw new Error('CNPJ inválido');
      }

      // Verifica cache primeiro
      const cache = Storage.recuperarCacheCNPJ(cnpjLimpo);
      if (cache) {
        console.log('Dados recuperados do cache');
        return {
          sucesso: true,
          dados: cache,
          origem: 'cache'
        };
      }

      // Tenta BrasilAPI primeiro (gratuita, sem restrições)
      console.log('Tentando BrasilAPI...');
      let resultado = await this.tentarBrasilAPI(cnpjLimpo);

      if (resultado.sucesso) {
        return resultado;
      }

      // Se falhou, tenta ReceitaWS
      console.log('BrasilAPI falhou, tentando ReceitaWS...');
      resultado = await this.tentarReceitaWS(cnpjLimpo);

      if (resultado.sucesso) {
        return resultado;
      }

      // Se tudo falhou, retorna erro com sugestão
      throw new Error('Não foi possível consultar o CNPJ nas APIs disponíveis. Os dados podem estar temporariamente indisponíveis.');

    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);

      // Adiciona ao histórico mesmo com erro
      Storage.adicionarHistorico({
        tipo: 'cnpj',
        cnpj: Validacao.limparCNPJ(cnpj),
        sucesso: false,
        erro: error.message
      });

      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  /**
   * Tenta consultar na BrasilAPI
   */
  async tentarBrasilAPI(cnpj) {
    try {
      const url = `${this.URLS.BRASILAPI}/${cnpj}`;
      const response = await this.fetchComTimeout(url);

      if (!response.ok) {
        throw new Error(`BrasilAPI: ${response.status}`);
      }

      const dados = await response.json();

      // Normaliza dados da BrasilAPI para nosso formato
      const dadosNormalizados = this.normalizarBrasilAPI(dados);

      // Salva no cache
      Storage.salvarCacheCNPJ(cnpj, dadosNormalizados);

      // Adiciona ao histórico
      Storage.adicionarHistorico({
        tipo: 'cnpj',
        cnpj: cnpj,
        nomeFantasia: dadosNormalizados.alias || 'Sem nome',
        sucesso: true
      });

      return {
        sucesso: true,
        dados: dadosNormalizados,
        origem: 'brasilapi'
      };

    } catch (error) {
      console.error('Erro BrasilAPI:', error);
      return { sucesso: false, erro: error.message };
    }
  },

  /**
   * Tenta consultar na ReceitaWS
   */
  async tentarReceitaWS(cnpj) {
    try {
      const url = `${this.URLS.RECEITAWS}/${cnpj}`;
      const response = await this.fetchComTimeout(url);

      if (!response.ok) {
        throw new Error(`ReceitaWS: ${response.status}`);
      }

      const dados = await response.json();

      if (dados.status === 'ERROR') {
        throw new Error(dados.message || 'Erro ao consultar ReceitaWS');
      }

      // Normaliza dados da ReceitaWS para nosso formato
      const dadosNormalizados = this.normalizarReceitaWS(dados);

      // Salva no cache
      Storage.salvarCacheCNPJ(cnpj, dadosNormalizados);

      // Adiciona ao histórico
      Storage.adicionarHistorico({
        tipo: 'cnpj',
        cnpj: cnpj,
        nomeFantasia: dadosNormalizados.alias || 'Sem nome',
        sucesso: true
      });

      return {
        sucesso: true,
        dados: dadosNormalizados,
        origem: 'receitaws'
      };

    } catch (error) {
      console.error('Erro ReceitaWS:', error);
      return { sucesso: false, erro: error.message };
    }
  },

  /**
   * Normaliza dados da BrasilAPI para formato padrão
   */
  normalizarBrasilAPI(dados) {
    return {
      taxId: dados.cnpj,
      alias: dados.nome_fantasia || dados.razao_social,
      company: {
        name: dados.razao_social,
        equity: dados.capital_social
      },
      founded: dados.data_inicio_atividade,
      status: {
        text: dados.descricao_situacao_cadastral
      },
      address: {
        street: dados.logradouro,
        number: dados.numero,
        details: dados.complemento,
        district: dados.bairro,
        city: dados.municipio,
        state: dados.uf,
        zip: dados.cep
      },
      mainActivity: {
        code: dados.cnae_fiscal,
        text: dados.cnae_fiscal_descricao
      },
      phones: dados.ddd_telefone_1 ? [{
        area: dados.ddd_telefone_1.substring(0, 2),
        number: dados.ddd_telefone_1.substring(2)
      }] : [],
      emails: dados.email ? [{
        address: dados.email
      }] : []
    };
  },

  /**
   * Normaliza dados da ReceitaWS para formato padrão
   */
  normalizarReceitaWS(dados) {
    return {
      taxId: dados.cnpj,
      alias: dados.fantasia || dados.nome,
      company: {
        name: dados.nome,
        equity: dados.capital_social ? parseFloat(dados.capital_social.replace(/[^\d,]/g, '').replace(',', '.')) : 0
      },
      founded: dados.abertura,
      status: {
        text: dados.situacao
      },
      address: {
        street: dados.logradouro,
        number: dados.numero,
        details: dados.complemento,
        district: dados.bairro,
        city: dados.municipio,
        state: dados.uf,
        zip: dados.cep
      },
      mainActivity: {
        code: dados.atividade_principal?.[0]?.code || '',
        text: dados.atividade_principal?.[0]?.text || ''
      },
      phones: dados.telefone ? [{
        area: dados.telefone.substring(0, 2),
        number: dados.telefone.substring(2)
      }] : [],
      emails: dados.email ? [{
        address: dados.email
      }] : []
    };
  },

  /**
   * Processa dados da API CNPJá para formato mais amigável
   * @param {Object} dados - Dados brutos da API
   * @returns {Object} - Dados processados
   */
  processarDadosCNPJ(dados) {
    // Trata diferentes estruturas de resposta da API
    const company = dados.company || {};
    const address = dados.address || {};

    return {
      cnpj: dados.taxId || dados.cnpj || '',
      razaoSocial: company.name || dados.name || 'Não informado',
      nomeFantasia: dados.alias || company.alias || company.name || 'Não informado',
      situacao: dados.status?.text || dados.registration?.status || 'Desconhecida',
      situacaoAtiva: this.verificarSituacaoAtiva(dados),
      dataAbertura: dados.founded || dados.registration?.founded || null,
      capitalSocial: company.equity || company.capital || 0,

      // Endereço
      endereco: {
        logradouro: address.street || '',
        numero: address.number || '',
        complemento: address.details || '',
        bairro: address.district || '',
        cidade: address.city || '',
        estado: address.state || '',
        cep: address.zip || '',
        enderecoCompleto: this.montarEnderecoCompleto(address)
      },

      // Atividades
      atividadePrincipal: dados.mainActivity?.text || dados.primary?.text || 'Não informada',
      cnae: dados.mainActivity?.code || dados.primary?.code || '',
      descricaoAtividade: dados.mainActivity?.text || '',

      // Contato
      telefone: dados.phones?.[0]?.area && dados.phones?.[0]?.number
        ? `${dados.phones[0].area}${dados.phones[0].number}`
        : '',
      email: dados.emails?.[0]?.address || '',

      // Dados para cálculo de score
      tempoFuncionamento: this.calcularTempoFuncionamento(dados.founded || dados.registration?.founded),
      cnaeCompativel: this.verificarCNAECompativel(dados.mainActivity?.code || dados.primary?.code),

      // Dados brutos para referência
      dadosOriginais: dados
    };
  },

  /**
   * Verifica se a situação cadastral está ativa
   * @param {Object} dados - Dados da API
   * @returns {boolean} - True se ativa
   */
  verificarSituacaoAtiva(dados) {
    const status = dados.status?.text || dados.registration?.status || '';
    const statusLower = status.toLowerCase();
    return statusLower.includes('ativa') || statusLower.includes('regular');
  },

  /**
   * Monta endereço completo
   * @param {Object} address - Dados do endereço
   * @returns {string} - Endereço formatado
   */
  montarEnderecoCompleto(address) {
    const partes = [];

    if (address.street) partes.push(address.street);
    if (address.number) partes.push(address.number);
    if (address.details) partes.push(address.details);
    if (address.district) partes.push(address.district);
    if (address.city) partes.push(address.city);
    if (address.state) partes.push(address.state);
    if (address.zip) partes.push(`CEP: ${address.zip}`);

    return partes.join(', ') || 'Endereço não disponível';
  },

  /**
   * Calcula tempo de funcionamento em anos
   * @param {string} dataAbertura - Data de abertura
   * @returns {number} - Anos de funcionamento
   */
  calcularTempoFuncionamento(dataAbertura) {
    if (!dataAbertura) return 0;

    const abertura = new Date(dataAbertura);
    const hoje = new Date();
    const diff = hoje - abertura;
    const anos = diff / (1000 * 60 * 60 * 24 * 365.25);

    return Math.max(0, Math.floor(anos));
  },

  /**
   * Verifica se o CNAE é compatível com bar/restaurante
   * @param {string} cnae - Código CNAE
   * @returns {boolean} - True se compatível
   */
  verificarCNAECompativel(cnae) {
    if (!cnae) return false;

    // CNAEs relacionados a alimentação e bebidas
    const cnaesCompativeis = [
      '5611-2', // Restaurantes e similares
      '5612-1', // Serviços ambulantes de alimentação
      '5620-1', // Fornecimento de alimentos preparados
      '5611-2/01', // Restaurantes e similares
      '5611-2/02', // Bares e outros estabelecimentos especializados em servir bebidas
      '5611-2/03', // Lanchonetes, casas de chá, de sucos e similares
      '4721-1', // Padaria e confeitaria com predominância de produção própria
      '1091-1', // Fabricação de produtos de panificação industrial
      '4729-6', // Comércio varejista de produtos alimentícios em geral
      '5612-1/00', // Serviços ambulantes de alimentação
      '5620-1/01', // Fornecimento de alimentos preparados preponderantemente para empresas
      '5620-1/02', // Serviços de alimentação para eventos e recepções - bufê
      '5620-1/03', // Cantinas - serviços de alimentação privativos
      '5620-1/04', // Fornecimento de alimentos preparados preponderantemente para consumo domiciliar
    ];

    const cnaeLimpo = cnae.replace(/[^\d]/g, '');

    return cnaesCompativeis.some(codigo => {
      const codigoLimpo = codigo.replace(/[^\d]/g, '');
      return cnaeLimpo.startsWith(codigoLimpo.substring(0, 4));
    });
  },

  // ========== API ViaCEP ==========

  /**
   * Consulta CEP na API ViaCEP
   * @param {string} cep - CEP a consultar
   * @returns {Promise<Object>} - Dados do endereço
   */
  async consultarCEP(cep) {
    try {
      // Remove formatação do CEP
      const cepLimpo = cep.replace(/[^\d]/g, '');

      // Valida CEP
      if (!Validacao.validarCEP(cepLimpo)) {
        throw new Error('CEP inválido');
      }

      // Faz requisição à API
      const url = `${this.URLS.VIACEP}/${cepLimpo}/json/`;
      const response = await this.fetchComTimeout(url);

      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const dados = await response.json();

      if (dados.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        sucesso: true,
        dados: dados
      };

    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // ========== CÁLCULO DE SCORE ==========

  /**
   * Calcula score de confiança do estabelecimento
   * @param {Object} dadosCNPJ - Dados processados do CNPJ
   * @param {string} cnpj - CNPJ limpo
   * @returns {Object} - Score e detalhes
   */
  calcularScore(dadosCNPJ, cnpj) {
    let score = 0;
    const detalhes = {
      sinaisPositivos: [],
      sinaisAlerta: []
    };

    // 1. Situação cadastral ativa (+30 pontos)
    if (dadosCNPJ.situacaoAtiva) {
      score += 30;
      detalhes.sinaisPositivos.push('Situação cadastral ativa');
    } else {
      detalhes.sinaisAlerta.push('Situação cadastral irregular');
    }

    // 2. Tempo de funcionamento (+20 pontos)
    const anos = dadosCNPJ.tempoFuncionamento;
    if (anos >= 3) {
      score += 20;
      detalhes.sinaisPositivos.push(`Estabelecimento com ${anos} anos de funcionamento`);
    } else if (anos >= 1) {
      score += 10;
      detalhes.sinaisPositivos.push(`Estabelecimento com ${anos} ano(s) de funcionamento`);
    } else {
      detalhes.sinaisAlerta.push('Estabelecimento novo (menos de 1 ano)');
    }

    // 3. CNAE compatível (+20 pontos)
    if (dadosCNPJ.cnaeCompativel) {
      score += 20;
      detalhes.sinaisPositivos.push('Atividade compatível com alimentação');
    } else {
      detalhes.sinaisAlerta.push('CNAE não é típico de bar/restaurante');
    }

    // 4. Avaliações de usuários (até +30 pontos)
    const statsReviews = Storage.calcularEstatisticasReviews(cnpj);

    if (statsReviews.total > 0) {
      let pontuacaoReviews = 0;

      // Garrafas lacradas (10 pontos)
      if (statsReviews.percentualGarrafasLacradas >= 80) {
        pontuacaoReviews += 10;
        detalhes.sinaisPositivos.push('Usuários confirmam bebidas lacradas');
      } else if (statsReviews.percentualGarrafasLacradas < 50) {
        detalhes.sinaisAlerta.push('Poucos usuários viram bebidas lacradas');
      }

      // Nota fiscal (10 pontos)
      if (statsReviews.percentualNotaFiscal >= 80) {
        pontuacaoReviews += 10;
        detalhes.sinaisPositivos.push('Usuários confirmam emissão de nota fiscal');
      } else if (statsReviews.percentualNotaFiscal < 50) {
        detalhes.sinaisAlerta.push('Poucos usuários viram nota fiscal');
      }

      // Limpeza (10 pontos)
      if (statsReviews.mediaLimpeza >= 4) {
        pontuacaoReviews += 10;
        detalhes.sinaisPositivos.push(`Boa avaliação de limpeza (${statsReviews.mediaLimpeza}/5)`);
      } else if (statsReviews.mediaLimpeza < 3) {
        detalhes.sinaisAlerta.push(`Baixa avaliação de limpeza (${statsReviews.mediaLimpeza}/5)`);
      }

      score += pontuacaoReviews;
      detalhes.sinaisPositivos.push(`${statsReviews.total} avaliação(ões) de usuários`);
    } else {
      detalhes.sinaisAlerta.push('Sem avaliações de usuários ainda');
    }

    // 5. Denúncias (penalização)
    const numDenuncias = Storage.contarDenuncias(cnpj);
    if (numDenuncias > 0) {
      const penalidade = Math.min(numDenuncias * 15, 45); // Máximo -45 pontos
      score = Math.max(0, score - penalidade);
      detalhes.sinaisAlerta.push(`${numDenuncias} denúncia(s) registrada(s)`);
    }

    // Garante que o score está entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Define categoria
    let categoria, classe, recomendacao;
    if (score >= 80) {
      categoria = 'Estabelecimento Confiável';
      classe = 'score-alta';
      recomendacao = 'Este estabelecimento apresenta bons indicadores de confiabilidade.';
    } else if (score >= 50) {
      categoria = 'Atenção Recomendada';
      classe = 'score-media';
      recomendacao = 'Alguns pontos de atenção foram identificados. Avalie com cautela.';
    } else {
      categoria = 'Risco Alto - Evite';
      classe = 'score-baixa';
      recomendacao = 'Indicadores de risco identificados. Recomenda-se evitar este estabelecimento.';
    }

    return {
      score: score,
      categoria: categoria,
      classe: classe,
      recomendacao: recomendacao,
      detalhes: detalhes,
      statsReviews: statsReviews,
      numDenuncias: numDenuncias
    };
  },

  // ========== GEOLOCALIZAÇÃO ==========

  /**
   * Obtém localização do usuário
   * @returns {Promise<Object>} - Coordenadas
   */
  async obterLocalizacao() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy
          });
        },
        (error) => {
          let mensagem = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagem = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              mensagem = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              mensagem = 'Timeout ao obter localização';
              break;
          }
          reject(new Error(mensagem));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Calcula distância entre duas coordenadas (Haversine)
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} - Distância em km
   */
  calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return distancia;
  },

  /**
   * Converte graus para radianos
   * @param {number} graus - Valor em graus
   * @returns {number} - Valor em radianos
   */
  toRad(graus) {
    return graus * (Math.PI / 180);
  }
};

// Torna disponível globalmente
window.API = API;
