# MetanolCheck 🔍

> Plataforma web para verificação de segurança de bares e restaurantes no Brasil, focada em prevenir casos de intoxicação por metanol.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [Deploy no Vercel](#deploy-no-vercel)
- [Desenvolvimento Local](#desenvolvimento-local)
- [APIs Utilizadas](#apis-utilizadas)
- [Metodologia de Cálculo do Score](#metodologia-de-cálculo-do-score)
- [Limitações](#limitações)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **MetanolCheck** é uma aplicação web frontend-only desenvolvida para ajudar consumidores brasileiros a verificarem a segurança de bares e restaurantes antes de consumir bebidas alcoólicas. A aplicação surgiu em resposta aos recentes casos de intoxicação por metanol no Brasil.

### Contexto

Metanol (álcool metílico) é altamente tóxico e pode causar:
- 🚨 **Cegueira permanente** com apenas 10ml
- ⚠️ **Morte** com 30-100ml
- 💔 **Sintomas graves** em 12-24h após consumo

Estabelecimentos inescrupulosos podem usar metanol para reduzir custos, colocando vidas em risco.

## ✨ Funcionalidades

### 🏠 Página Inicial
- Campo de busca por CNPJ, nome ou localização
- Estatísticas em tempo real
- Histórico de buscas recentes
- Informações educativas sobre metanol

### 📊 Página de Resultados
- **Score de Confiança (0-100)** com classificação visual
- Dados cadastrais completos do estabelecimento
- Análise de riscos detalhada
- Sistema de avaliações de usuários
- Registro de denúncias
- Informações educativas sobre bebidas adulteradas

### 🚩 Página de Denúncia
- Formulário completo de denúncia
- Opção de denúncia anônima
- Orientações sobre como proceder
- Links para autoridades competentes

### 📚 Página Educativa
- Informações sobre metanol e seus riscos
- Como identificar bebidas adulteradas
- Sintomas de intoxicação
- Quiz interativo de conhecimento
- Práticas seguras de consumo

### ℹ️ Página Sobre
- Missão e objetivos do projeto
- Metodologia de cálculo do score
- Limitações da ferramenta
- Tecnologias utilizadas

## 🛠 Tecnologias

### Frontend
- **HTML5** - Semântico e acessível
- **CSS3** - Com variáveis CSS e design responsivo
- **JavaScript** - Vanilla JS, sem frameworks

### Armazenamento
- **localStorage** - Todos os dados armazenados localmente no navegador
- Cache de consultas CNPJ
- Reviews e denúncias de usuários

### APIs Externas
- **BrasilAPI** - Dados cadastrais de empresas (API pública brasileira)
- **ReceitaWS** - Fallback para consulta de CNPJ
- **ViaCEP** - Validação de endereços
- **Geolocation API** - Localização do usuário

### Hospedagem
- **Vercel** - Hospedagem gratuita com CDN global

## 📁 Estrutura do Projeto

```
metanolcheck/
├── index.html              # Página inicial
├── resultado.html          # Página de resultados
├── denuncia.html          # Página de denúncia
├── educacao.html          # Página educativa
├── sobre.html             # Página sobre o projeto
├── vercel.json            # Configuração Vercel
├── README.md              # Este arquivo
├── css/
│   └── styles.css         # Estilos globais
├── js/
│   ├── main.js            # Funções principais
│   ├── api.js             # Chamadas de API
│   ├── storage.js         # Gerenciamento localStorage
│   └── validacao.js       # Validações de formulários
└── assets/
    └── images/            # Imagens (vazio inicialmente)
```

## 🚀 Como Usar

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para consultas de API)
- JavaScript habilitado

### Consultar um Estabelecimento

1. Acesse a página inicial
2. Digite o CNPJ do estabelecimento (ou busque por nome/localização)
3. Clique em "Consultar"
4. Analise o score e as informações apresentadas

### Avaliar um Estabelecimento

1. Acesse a página de resultados do estabelecimento
2. Clique em "Avaliar Este Local"
3. Responda às perguntas sobre segurança
4. Adicione comentários (opcional)
5. Envie a avaliação

### Fazer uma Denúncia

1. Acesse a página "Denunciar"
2. Preencha o formulário com detalhes
3. Escolha se deseja denúncia anônima
4. Envie (recomendamos também denunciar às autoridades)

## 📦 Deploy no Vercel

### Método 1: Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Navegar até a pasta do projeto
cd metanolcheck

# Fazer deploy
vercel

# Para deploy em produção
vercel --prod
```

### Método 2: GitHub + Vercel

1. Crie um repositório no GitHub
2. Faça push do código:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/metanolcheck.git
git push -u origin main
```

3. Acesse [vercel.com](https://vercel.com)
4. Clique em "New Project"
5. Importe o repositório do GitHub
6. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
7. Clique em "Deploy"

### Método 3: Deploy Direto

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Arraste a pasta do projeto
4. Clique em "Deploy"

### Configurações Recomendadas

O arquivo `vercel.json` já está configurado com:
- URLs limpas (sem .html)
- Headers de segurança
- Cache otimizado
- Reescritas de URL

## 💻 Desenvolvimento Local

### Opção 1: Servidor HTTP Simples (Python)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Acesse: http://localhost:8000
```

### Opção 2: Live Server (VS Code)

1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### Opção 3: Node.js http-server

```bash
# Instalar
npm install -g http-server

# Executar
http-server -p 8000

# Acesse: http://localhost:8000
```

## 🔌 APIs Utilizadas

### Sistema de Fallback em Cascata

A aplicação tenta múltiplas APIs na seguinte ordem:

1. **Cache Local** (primeiro)
2. **BrasilAPI** (preferencial)
3. **ReceitaWS** (fallback)

### BrasilAPI

**URL:** `https://brasilapi.com.br/api/cnpj/v1/{CNPJ}`

**Características:**
- ✅ 100% Gratuita e pública
- ✅ Não requer autenticação
- ✅ Dados oficiais da Receita Federal
- ✅ CORS habilitado
- ✅ Alta disponibilidade

**Exemplo de uso:**
```javascript
const response = await fetch('https://brasilapi.com.br/api/cnpj/v1/42143596000129');
const dados = await response.json();
```

### ReceitaWS (Fallback)

**URL:** `https://receitaws.com.br/v1/cnpj/{CNPJ}`

**Características:**
- ✅ Gratuita (com limites)
- ✅ Não requer autenticação
- ✅ Dados da Receita Federal
- ⚠️ Limite de 3 requisições por minuto

**Fallback Final:** Em caso de erro em todas as APIs, a aplicação usa cache local.

### ViaCEP API

**URL:** `https://viacep.com.br/ws/{CEP}/json/`

**Características:**
- Completamente gratuita
- Não requer autenticação
- Retorna dados de endereço
- CORS habilitado

## 📊 Metodologia de Cálculo do Score

O score de confiança (0-100) é calculado com base em:

| Critério | Pontos |
|----------|--------|
| **Situação Cadastral Ativa** | +30 |
| **Tempo de Funcionamento ≥3 anos** | +20 |
| **Tempo de Funcionamento 1-3 anos** | +10 |
| **CNAE Compatível com Alimentação** | +20 |
| **Avaliações: Garrafas Lacradas ≥80%** | +10 |
| **Avaliações: Nota Fiscal ≥80%** | +10 |
| **Avaliações: Limpeza ≥4/5** | +10 |
| **Cada Denúncia Registrada** | -15 |

### Classificação

- **80-100:** 🟢 Estabelecimento Confiável
- **50-79:** 🟡 Atenção Recomendada
- **0-49:** 🔴 Risco Alto - Evite

### Transparência

Toda a lógica de cálculo está disponível em `js/api.js` na função `calcularScore()`.

## ⚠️ Limitações

### Técnicas
- Dependência de APIs públicas (podem estar offline)
- Cache local limitado pelo navegador
- Sem análise química de bebidas
- Cobertura limitada aos estabelecimentos pesquisados

### Responsabilidade
- ❌ Não substitui fiscalização oficial
- ❌ Não garante 100% de segurança
- ❌ Avaliações podem ser subjetivas
- ❌ Não nos responsabilizamos por decisões baseadas nestas informações

### Recomendações
- Use como **ferramenta complementar**
- Sempre observe o estabelecimento pessoalmente
- Confie em seus instintos
- Denuncie suspeitas às autoridades

## 🤝 Contribuindo

Contribuições são bem-vindas! Este é um projeto de código aberto.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Ideias para Contribuição

- 🌍 Tradução para outros idiomas
- 📱 Melhorias de responsividade
- ♿ Acessibilidade aprimorada
- 🎨 Melhorias de UI/UX
- 🐛 Correção de bugs
- 📝 Documentação adicional

## 📞 Contato e Suporte

- **Website:** [metanolcheck.vercel.app](https://metanolcheck.vercel.app) (após deploy)
- **Email:** contato@metanolcheck.com.br (configurar)
- **Issues:** Use a aba "Issues" do GitHub

## 🚨 Em Caso de Emergência

Se você ou alguém apresentar sintomas de intoxicação por metanol:

- 🚑 **SAMU:** 192
- ☎️ **Disque-Intoxicação:** 0800 722 6001
- 🚒 **Bombeiros:** 193

**Sintomas:** Visão turva, náusea, dor de cabeça severa, dificuldade respiratória

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- **BrasilAPI** - Por fornecer API pública e gratuita de dados brasileiros
- **ReceitaWS** - Por disponibilizar API de consulta CNPJ
- **ViaCEP** - Por fornecer API gratuita de CEPs
- **Font Awesome** - Por disponibilizar ícones gratuitamente
- **Vercel** - Por hospedagem gratuita e confiável
- **Comunidade** - Por contribuir com avaliações e denúncias

## 📝 Notas Finais

Este projeto foi desenvolvido como uma ferramenta de **utilidade pública** em resposta a uma necessidade real de segurança. Não tem fins lucrativos e seu único objetivo é **proteger vidas**.

**⚠️ IMPORTANTE:** Esta ferramenta não substitui a fiscalização oficial. Em caso de suspeita, sempre contate as autoridades competentes:
- Vigilância Sanitária
- Polícia Civil
- Procon
- Ministério Público

---

**Desenvolvido com ❤️ para proteger vidas**

**Última atualização:** Novembro 2025
