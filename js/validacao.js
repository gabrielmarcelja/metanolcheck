/**
 * Módulo de Validação
 * Funções para validar entradas de formulários
 */

const Validacao = {
  /**
   * Valida formato e dígitos verificadores de CNPJ
   * @param {string} cnpj - CNPJ a ser validado
   * @returns {boolean} - True se válido
   */
  validarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    // Validação dos dígitos verificadores
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) {
      return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) {
      return false;
    }

    return true;
  },

  /**
   * Formata CNPJ para o padrão XX.XXX.XXX/XXXX-XX
   * @param {string} cnpj - CNPJ sem formatação
   * @returns {string} - CNPJ formatado
   */
  formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');

    if (cnpj.length !== 14) {
      return cnpj;
    }

    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  },

  /**
   * Remove formatação do CNPJ
   * @param {string} cnpj - CNPJ formatado
   * @returns {string} - Apenas números
   */
  limparCNPJ(cnpj) {
    return cnpj.replace(/[^\d]/g, '');
  },

  /**
   * Valida formato de CEP
   * @param {string} cep - CEP a ser validado
   * @returns {boolean} - True se válido
   */
  validarCEP(cep) {
    cep = cep.replace(/[^\d]/g, '');
    return cep.length === 8 && /^\d{8}$/.test(cep);
  },

  /**
   * Formata CEP para o padrão XXXXX-XXX
   * @param {string} cep - CEP sem formatação
   * @returns {string} - CEP formatado
   */
  formatarCEP(cep) {
    cep = cep.replace(/[^\d]/g, '');

    if (cep.length !== 8) {
      return cep;
    }

    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  },

  /**
   * Valida email
   * @param {string} email - Email a ser validado
   * @returns {boolean} - True se válido
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Valida telefone brasileiro
   * @param {string} telefone - Telefone a ser validado
   * @returns {boolean} - True se válido
   */
  validarTelefone(telefone) {
    telefone = telefone.replace(/[^\d]/g, '');
    // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
    return telefone.length === 10 || telefone.length === 11;
  },

  /**
   * Formata telefone brasileiro
   * @param {string} telefone - Telefone sem formatação
   * @returns {string} - Telefone formatado
   */
  formatarTelefone(telefone) {
    telefone = telefone.replace(/[^\d]/g, '');

    if (telefone.length === 11) {
      return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }

    return telefone;
  },

  /**
   * Sanitiza input do usuário para prevenir XSS
   * @param {string} input - Texto a ser sanitizado
   * @returns {string} - Texto seguro
   */
  sanitizarInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => map[char]);
  },

  /**
   * Valida se a string não está vazia
   * @param {string} valor - Valor a ser validado
   * @returns {boolean} - True se não vazio
   */
  validarObrigatorio(valor) {
    return valor !== null && valor !== undefined && valor.trim() !== '';
  },

  /**
   * Valida comprimento mínimo
   * @param {string} valor - Valor a ser validado
   * @param {number} minimo - Comprimento mínimo
   * @returns {boolean} - True se válido
   */
  validarComprimentoMinimo(valor, minimo) {
    return valor && valor.length >= minimo;
  },

  /**
   * Valida comprimento máximo
   * @param {string} valor - Valor a ser validado
   * @param {number} maximo - Comprimento máximo
   * @returns {boolean} - True se válido
   */
  validarComprimentoMaximo(valor, maximo) {
    return valor && valor.length <= maximo;
  },

  /**
   * Valida URL
   * @param {string} url - URL a ser validada
   * @returns {boolean} - True se válida
   */
  validarURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Valida data no formato YYYY-MM-DD
   * @param {string} data - Data a ser validada
   * @returns {boolean} - True se válida
   */
  validarData(data) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) {
      return false;
    }

    const date = new Date(data);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Valida se a data não é futura
   * @param {string} data - Data a ser validada
   * @returns {boolean} - True se não for futura
   */
  validarDataNaoFutura(data) {
    const date = new Date(data);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    return date <= hoje;
  },

  /**
   * Adiciona máscara de CNPJ em tempo real
   * @param {HTMLInputElement} input - Input element
   */
  aplicarMascaraCNPJ(input) {
    input.addEventListener('input', (e) => {
      let valor = e.target.value.replace(/[^\d]/g, '');

      if (valor.length <= 14) {
        if (valor.length > 12) {
          valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
        } else if (valor.length > 8) {
          valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
        } else if (valor.length > 5) {
          valor = valor.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
        } else if (valor.length > 2) {
          valor = valor.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
        }

        e.target.value = valor;
      } else {
        e.target.value = valor.substring(0, 14);
      }
    });
  },

  /**
   * Adiciona máscara de CEP em tempo real
   * @param {HTMLInputElement} input - Input element
   */
  aplicarMascaraCEP(input) {
    input.addEventListener('input', (e) => {
      let valor = e.target.value.replace(/[^\d]/g, '');

      if (valor.length <= 8) {
        if (valor.length > 5) {
          valor = valor.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
        }
        e.target.value = valor;
      } else {
        e.target.value = valor.substring(0, 8);
      }
    });
  },

  /**
   * Adiciona máscara de telefone em tempo real
   * @param {HTMLInputElement} input - Input element
   */
  aplicarMascaraTelefone(input) {
    input.addEventListener('input', (e) => {
      let valor = e.target.value.replace(/[^\d]/g, '');

      if (valor.length <= 11) {
        if (valor.length > 10) {
          valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
        } else if (valor.length > 6) {
          valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (valor.length > 2) {
          valor = valor.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        }
        e.target.value = valor;
      } else {
        e.target.value = valor.substring(0, 11);
      }
    });
  },

  /**
   * Valida formulário inteiro
   * @param {HTMLFormElement} form - Formulário a ser validado
   * @returns {Object} - { valido: boolean, erros: Array }
   */
  validarFormulario(form) {
    const erros = [];
    const inputs = form.querySelectorAll('[required], [data-validacao]');

    inputs.forEach(input => {
      const valor = input.value.trim();
      const nome = input.getAttribute('data-nome') || input.name || 'Campo';

      // Validação de obrigatório
      if (input.hasAttribute('required') && !this.validarObrigatorio(valor)) {
        erros.push(`${nome} é obrigatório`);
        input.classList.add('error');
        return;
      }

      // Validações específicas por tipo
      const tipoValidacao = input.getAttribute('data-validacao');

      if (valor && tipoValidacao) {
        switch (tipoValidacao) {
          case 'cnpj':
            if (!this.validarCNPJ(valor)) {
              erros.push(`${nome} inválido`);
              input.classList.add('error');
            }
            break;
          case 'email':
            if (!this.validarEmail(valor)) {
              erros.push(`${nome} inválido`);
              input.classList.add('error');
            }
            break;
          case 'telefone':
            if (!this.validarTelefone(valor)) {
              erros.push(`${nome} inválido`);
              input.classList.add('error');
            }
            break;
          case 'cep':
            if (!this.validarCEP(valor)) {
              erros.push(`${nome} inválido`);
              input.classList.add('error');
            }
            break;
          case 'url':
            if (!this.validarURL(valor)) {
              erros.push(`${nome} inválida`);
              input.classList.add('error');
            }
            break;
          case 'data':
            if (!this.validarData(valor)) {
              erros.push(`${nome} inválida`);
              input.classList.add('error');
            }
            break;
        }
      }

      // Remove classe de erro se válido
      if (erros.length === 0 || !erros.some(e => e.includes(nome))) {
        input.classList.remove('error');
      }
    });

    return {
      valido: erros.length === 0,
      erros: erros
    };
  },

  /**
   * Limpa erros de validação do formulário
   * @param {HTMLFormElement} form - Formulário
   */
  limparErrosFormulario(form) {
    const inputs = form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));

    const mensagensErro = form.querySelectorAll('.form-error');
    mensagensErro.forEach(msg => msg.remove());
  }
};

// Torna disponível globalmente
window.Validacao = Validacao;
