# COT Corregedoria Bot

Projeto de bot Discord com foco em tickets, corregedoria, análise assistida por IA, transcripts, painel web e rotas investigativas.

## O que já existe no repositório

- Base do bot Discord
- Banco SQLite com schema inicial
- Ticket service
- Eventos principais (`messageCreate`, `messageDelete`, `interactionCreate`)
- Logger blindado com webhook opcional
- Transcript HTML
- Painel web básico
- Rotas investigativas (`investigate`, `heatmap`, `network`, `report`)
- IA base e módulos auxiliares:
  - analyzer
  - autoReply
  - antiCorruption
  - fakeReportDetector
  - chiefAI
  - corregedorAI
  - predictor
  - riskEngine
  - reportGenerator

## Como configurar

1. Copie `.env.example` para `.env`
2. Preencha os campos obrigatórios
3. Instale dependências:

```bash
npm install
```

4. Registre os slash commands:

```bash
npm run deploy
```

5. Rode o bot:

```bash
npm start
```

6. Rode o painel web:

```bash
npm run web
```

7. Rode o webhook de backup:

```bash
npm run webhook
```

## Estrutura

- `src/index.js` → entrada principal do bot
- `src/web/server.js` → painel web
- `src/web/webhookServer.js` → backup webhook
- `src/ticket/` → serviços de ticket
- `src/events/` → eventos do Discord
- `src/ai/` → módulos de análise
- `src/transcript/` → transcripts
- `src/utils/` → helpers

## Observação

O repositório já está numa base forte, mas ainda precisa de integração e teste real de runtime para ficar 100% plug and play.
