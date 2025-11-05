# 📡 Arquitetura de APIs - MetanolCheck

## 🎯 Objetivo
Consultar dados cadastrais de estabelecimentos (CNPJ) através de APIs públicas brasileiras gratuitas, com sistema de fallback robusto.

---

## 🔌 APIs Utilizadas

### 1. **BrasilAPI** (Preferencial) ⭐
- **URL:** `https://brasilapi.com.br/api/cnpj/v1/{CNPJ}`
- **Fonte:** Dados oficiais da Receita Federal do Brasil
- **Limitações:** Nenhuma (gratuita e pública)
- **CORS:** ✅ Habilitado
- **Prioridade:** 1ª escolha

**Exemplo de Resposta:**
```json
{
  "cnpj": "11903789000107",
  "razao_social": "C.B. BRASILIA COMERCIO DE ALIMENTOS LTDA",
  "nome_fantasia": "COCO BAMBU PIZZARIA E COZINHA",
  "cnae_fiscal": 5611201,
  "cnae_fiscal_descricao": "Restaurantes e similares",
  "descricao_situacao_cadastral": "ATIVA",
  "data_inicio_atividade": "2010-04-27",
  "capital_social": 3000000,
  "logradouro": "SCN QUADRA 5 BLOCO A",
  "numero": "S/N",
  "municipio": "BRASILIA",
  "uf": "DF",
  "cep": "70715900",
  "ddd_telefone_1": "6130381818",
  "email": null
}
```

### 2. **ReceitaWS** (Fallback) 🔄
- **URL:** `https://receitaws.com.br/v1/cnpj/{CNPJ}`
- **Fonte:** Dados da Receita Federal
- **Limitações:** 3 requisições por minuto
- **CORS:** ✅ Habilitado
- **Prioridade:** 2ª escolha (se BrasilAPI falhar)

**Exemplo de Resposta:**
```json
{
  "cnpj": "11.903.789/0001-07",
  "nome": "C.B. BRASILIA COMERCIO DE ALIMENTOS LTDA",
  "fantasia": "COCO BAMBU PIZZARIA E COZINHA",
  "atividade_principal": [
    {
      "code": "56.11-2-01",
      "text": "Restaurantes e similares"
    }
  ],
  "situacao": "ATIVA",
  "abertura": "27/04/2010",
  "capital_social": "3.000.000,00",
  "logradouro": "SCN QUADRA 5 BLOCO A",
  "numero": "S/N",
  "municipio": "BRASILIA",
  "uf": "DF",
  "cep": "70.715-900",
  "telefone": "(61) 3038-1818",
  "email": null
}
```

### 3. **ViaCEP** (Complementar) 📍
- **URL:** `https://viacep.com.br/ws/{CEP}/json/`
- **Uso:** Validação e complemento de endereços
- **Limitações:** Nenhuma
- **CORS:** ✅ Habilitado

---

## 🔄 Fluxo de Consulta (Sistema de Fallback em Cascata)

```
┌──────────────────────────────────────────────────────┐
│  usuário.consultarCNPJ("11903789000107")            │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ 1️⃣ Verifica CACHE LOCAL   │
        │    (localStorage 24h)      │
        └────────┬───────────────────┘
                 │
         ┌───────┴───────┐
         │ Encontrou?    │
         └───┬───────┬───┘
             │ SIM   │ NÃO
             ▼       │
        ┌────────┐  │
        │RETORNA │  │
        │ cache  │  │
        └────────┘  │
                    ▼
        ┌────────────────────────────┐
        │ 2️⃣ Tenta BrasilAPI        │
        │    tentarBrasilAPI(cnpj)   │
        └────────┬───────────────────┘
                 │
         ┌───────┴───────┐
         │ Sucesso?      │
         └───┬───────┬───┘
             │ SIM   │ NÃO
             │       │
             ▼       ▼
        ┌────────┐  ┌────────────────────────────┐
        │Normaliza│  │ 3️⃣ Tenta ReceitaWS        │
        │ Salva  │  │    tentarReceitaWS(cnpj)   │
        │RETORNA │  └────────┬───────────────────┘
        └────────┘           │
                     ┌───────┴───────┐
                     │ Sucesso?      │
                     └───┬───────┬───┘
                         │ SIM   │ NÃO
                         │       │
                         ▼       ▼
                    ┌────────┐  ┌────────┐
                    │Normaliza│  │ ERRO   │
                    │ Salva  │  │ (todas │
                    │RETORNA │  │falhou) │
                    └────────┘  └────────┘
```

---

## 🔀 Normalização de Dados (Correlação)

As APIs retornam dados em formatos diferentes. Criamos um **formato padronizado interno**:

### Formato Padrão (Unificado)
```javascript
{
  taxId: "11903789000107",           // CNPJ sem formatação
  alias: "COCO BAMBU",                // Nome fantasia
  company: {
    name: "C.B. BRASILIA...",         // Razão social
    equity: 3000000                    // Capital social (número)
  },
  founded: "2010-04-27",              // Data abertura (ISO)
  status: {
    text: "ATIVA"                      // Situação cadastral
  },
  address: {
    street: "SCN QUADRA 5 BLOCO A",
    number: "S/N",
    district: "ASA NORTE",
    city: "BRASILIA",
    state: "DF",
    zip: "70715900"
  },
  mainActivity: {
    code: 5611201,                     // CNAE (número)
    text: "Restaurantes e similares"
  },
  phones: [{ area: "61", number: "30381818" }],
  emails: [{ address: "..." }]
}
```

### Mapeamento BrasilAPI → Formato Padrão
```javascript
normalizarBrasilAPI(dados) {
  return {
    taxId: dados.cnpj,                           // cnpj
    alias: dados.nome_fantasia,                  // nome_fantasia
    company: {
      name: dados.razao_social,                  // razao_social
      equity: dados.capital_social               // capital_social (já é número)
    },
    founded: dados.data_inicio_atividade,        // data_inicio_atividade
    status: {
      text: dados.descricao_situacao_cadastral   // descricao_situacao_cadastral
    },
    mainActivity: {
      code: dados.cnae_fiscal,                   // cnae_fiscal (número)
      text: dados.cnae_fiscal_descricao          // cnae_fiscal_descricao
    }
    // ... demais campos
  };
}
```

### Mapeamento ReceitaWS → Formato Padrão
```javascript
normalizarReceitaWS(dados) {
  return {
    taxId: dados.cnpj,                           // cnpj (remove formatação)
    alias: dados.fantasia || dados.nome,         // fantasia ou nome
    company: {
      name: dados.nome,                          // nome
      equity: parseFloat(                        // capital_social (converte string)
        dados.capital_social
          .replace(/[^\d,]/g, '')
          .replace(',', '.')
      )
    },
    founded: dados.abertura,                     // abertura (DD/MM/YYYY)
    status: {
      text: dados.situacao                       // situacao
    },
    mainActivity: {
      code: dados.atividade_principal[0].code,   // atividade_principal[0].code
      text: dados.atividade_principal[0].text    // atividade_principal[0].text
    }
    // ... demais campos
  };
}
```

---

## 🎯 Correlação de Dados com localStorage

### Cache Local
```javascript
// Estrutura do cache
{
  "11903789000107": {
    dados: { /* formato padrão normalizado */ },
    timestamp: 1699123456789,
    dataCache: "2025-11-05T10:00:00.000Z"
  }
}
```

### Reviews de Usuários
```javascript
{
  "11903789000107": [
    {
      id: "abc123",
      data: "2025-11-05T10:30:00",
      garrafasLacradas: true,
      notaFiscal: true,
      precosNormais: true,
      limpeza: 5,
      comentario: "Ótimo lugar"
    }
  ]
}
```

### Denúncias
```javascript
{
  "11903789000107": [
    {
      id: "def456",
      data: "2025-11-05T09:00:00",
      descricao: "Bebidas suspeitas",
      anonimo: true
    }
  ]
}
```

---

## 📊 Cálculo do Score de Confiança

O score (0-100) é calculado correlacionando:

1. **Dados da API** (50 pontos)
   - Situação cadastral ativa: +30
   - Tempo funcionamento ≥3 anos: +20
   - CNAE compatível: +20

2. **Reviews de Usuários** (30 pontos)
   - Garrafas lacradas ≥80%: +10
   - Nota fiscal ≥80%: +10
   - Limpeza ≥4/5: +10

3. **Denúncias** (penalização)
   - Cada denúncia: -15 pontos

```javascript
const score = API.calcularScore(dadosNormalizados, cnpj);
// Correlaciona dados da API + localStorage (reviews + denúncias)
```

---

## 🔍 Como Verificar Qual API Foi Usada

### No Console do Navegador (F12):
```javascript
// A aplicação registra logs:
"Tentando BrasilAPI..."           // Tentativa 1
"Dados recuperados do cache"      // Se encontrou no cache
"BrasilAPI falhou, tentando..."   // Tentativa 2
```

### No Código:
```javascript
const response = await API.consultarCNPJ('11903789000107');
console.log(response.origem);
// Retorna: "cache" | "brasilapi" | "receitaws"
```

---

## 🚀 Vantagens da Arquitetura

1. ✅ **Alta disponibilidade** - Se uma API cair, usa outra
2. ✅ **Performance** - Cache local reduz chamadas
3. ✅ **Sem custo** - Todas as APIs são gratuitas
4. ✅ **Dados oficiais** - Receita Federal do Brasil
5. ✅ **Offline-first** - Funciona com dados em cache
6. ✅ **Formato único** - Normalização facilita manutenção

---

## 📝 Exemplo Completo de Fluxo

```javascript
// 1. Usuário busca CNPJ
const resultado = await API.consultarCNPJ('11903789000107');

// 2. Sistema verifica cache (24h)
// ❌ Não encontrou

// 3. Tenta BrasilAPI
// ✅ Sucesso! Retorna dados brutos

// 4. Normaliza dados
const dadosNormalizados = API.normalizarBrasilAPI(resultado.dados);

// 5. Salva no cache para próximas consultas
Storage.salvarCacheCNPJ('11903789000107', dadosNormalizados);

// 6. Processa dados para exibição
const dadosProcessados = API.processarDadosCNPJ(dadosNormalizados);

// 7. Calcula score correlacionando:
//    - Dados da API (CNPJ)
//    - Reviews do localStorage
//    - Denúncias do localStorage
const score = API.calcularScore(dadosProcessados, '11903789000107');

// 8. Retorna tudo para interface
return {
  estabelecimento: dadosProcessados,
  score: score,
  origem: 'brasilapi'
};
```

---

## 🔐 Segurança e Validação

1. **Validação de CNPJ** antes de consultar
2. **Timeout** de 10s para todas requisições
3. **Sanitização** de dados do usuário (reviews/denúncias)
4. **CORS** habilitado em todas as APIs públicas

---

## 📅 Atualização dos Dados

- **Cache:** 24 horas
- **APIs:** Dados sempre atualizados da Receita Federal
- **Reviews/Denúncias:** Tempo real (localStorage)

---

**Última atualização:** 2025-11-05
**Versão:** 1.1.0
