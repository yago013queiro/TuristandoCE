# Turistando CE

Plataforma digital de turismo do Ceará — descubra destinos, hotéis, restaurantes, passeios, eventos e monte roteiros personalizados.

## Tecnologias

- HTML5, CSS3, JavaScript (ES6 modules)
- Leaflet + OpenStreetMap
- localStorage para persistência

## Como executar

A aplicação é uma SPA com History API. É necessário servir os arquivos via servidor HTTP.

### Opção 1: Live Server (VS Code)

1. Instale a extensão **Live Server**
2. Clique com botão direito em `index.html` → **Open with Live Server**

### Opção 2: npx serve

```bash
npx serve .
```

Acesse `http://localhost:3000` (ou a porta indicada).

### Opção 3: Python

```bash
python -m http.server 8080
```

> **Nota:** Para rotas diretas (ex: `/cidade/fortaleza`), alguns servidores simples retornam 404 ao recarregar. Use Live Server ou `npx serve` que fazem fallback para `index.html`.

## Estrutura

```
├── index.html          # Shell SPA
├── styles/             # CSS modular (tokens, componentes, páginas)
├── scripts/
│   ├── app.js          # Bootstrap
│   ├── router.js       # Navegação History API
│   ├── components/     # UI reutilizável
│   ├── pages/          # Views por rota
│   ├── services/       # Lógica de negócio
│   └── storage/        # Persistência localStorage
└── data/               # Seed e constantes
```

## Funcionalidades

- Home com hero, busca e seções de descoberta
- Busca com filtros funcionais (tipo, cidade, tags, ordenação)
- Páginas de detalhe: cidade, praia, hotel, restaurante, passeio, evento
- Mapa interativo com Leaflet
- Planejador de viagem com roteiro automático
- Favoritos, histórico e perfil (localStorage)
- Cadastro de estabelecimentos (parceiros)
- Modo escuro e ferramentas de acessibilidade

## Conta demo

Crie uma conta na interface ou use login/registro. Parceiros podem cadastrar estabelecimentos em `/cadastrar`.

Para restaurar dados demo: Perfil → **Restaurar dados demo**.
