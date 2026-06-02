# 🏆 Bolão Copa 2026 — Vendemmia

Plataforma corporativa de Bolão para a Copa do Mundo FIFA 2026. Desenvolvida para integrar colaboradores, fomentar a competição saudável e proporcionar uma experiência interativa completa com palpites de jogos, mural social com mídias e rankings dinâmicos por departamento e gestor.

---

## 🚀 Funcionalidades Principais

*   **Palpites de Partidas (Jogos):** Registro e edição de palpites para todas as fases da Copa. Os palpites ficam bloqueados individualmente conforme o início dos jogos se aproxima.
*   **Previsões Finais (Bracket):** Palpites especiais para Campeão, Vice-campeão e Artilheiro da Copa, concedendo pontuações bônus ao final do torneio.
*   **Ranking Interativo:**
    *   **Geral:** Pontuação acumulada por todos os usuários.
    *   **Por Departamento:** Competição entre áreas/setores da empresa.
    *   **Por Gestor:** Agrupamento de pontuações conforme a liderança direta.
*   **Mural Social (Mural):** Feed social onde colaboradores podem compartilhar mensagens, fotos e vídeos (via Vercel Blob), curtir e comentar nas postagens.
*   **Modo TV (Scoreboard):** Rota otimizada (`/tv`) para exibição contínua do ranking geral e atualizações em tempo real nos painéis e TVs dos escritórios da empresa.
*   **Notificações & Lembretes:** Integração com cronjobs para envio automatizado de lembretes diários e avisos de resultados de jogos.
*   **Painel de Administração completo:** Gerenciamento de usuários (ativação, cargos), sincronização e lançamento de placares oficiais, regras de pontuação e disparo manual de mensagens.

---

## 🛠️ Stack Tecnológica

*   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Estilização:** [TailwindCSS v3](https://tailwindcss.com/)
*   **Banco de Dados:** [SQLite via Turso (libsql)](https://turso.tech)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Sessão & Autenticação:** JWT nativo via [Jose](https://github.com/panva/jose)
*   **Upload de Mídias:** [Vercel Blob Storage](https://vercel.com/storage/blob)
*   **Envio de E-mails:** [Nodemailer (SMTP)](https://nodemailer.com/)
*   **Resultados de Jogos:** [API-Football (API-Sports)](https://api-sports.io)

---

## 💻 Desenvolvimento Local

### 1. Pré-requisitos
*   Node.js v20 ou superior instalado.
*   Instalar dependências:
    ```bash
    npm install
    ```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local` e preencha com as suas chaves locais:
```bash
cp .env.example .env.local
```

### 3. Banco de Dados & Migrações
O projeto utiliza o Drizzle ORM para gerenciar o banco de dados. Execute os comandos abaixo para gerar e aplicar o schema no banco configurado:
```bash
# Gerar arquivos de migração
npm run db:generate

# Aplicar migrações ao banco de dados
npm run db:migrate
```

### 4. Populando Dados Iniciais (Seeds)
Para facilitar os testes locais, popule as tabelas com os dados iniciais:
```bash
# Cria o usuário administrador padrão
npm run db:seed

# Popula o calendário de partidas oficiais da Copa do Mundo 2026
npm run db:seed-matches

# (Opcional) Cria dados de usuários fictícios para testes de ranking
npm run db:seed-users
```

### 5. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
O sistema estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 🚢 CI/CD & Deploy Automático

A plataforma está configurada para deploy contínuo através do **GitHub Actions** toda vez que houver um `push` na branch `main`.

### Como Funciona o Pipeline:
1.  **Checkout & Setup:** O repositório é clonado e o ambiente Docker Buildx é configurado.
2.  **Injeção de Variáveis:** O workflow substitui os placeholders do arquivo `.env.docker.prod` pelas variáveis reais contidas no **GitHub Secrets** do repositório.
3.  **Build Docker:** Compila a imagem localmente utilizando o `Dockerfile.prod` (otimizado com a build nativa `standalone` do Next.js), instalando também o serviço de `cron` e `curl` no container.
4.  **Registry Push:** Envia a imagem buildada para o Azure Container Registry (`vdmprod.azurecr.io/samples/bolaodacopa`).
5.  **Recriação no Portainer:** Realiza uma chamada de API ao Portainer para recriar o container `bolaodacopa`, forçando o pull da nova imagem e reiniciando a aplicação de forma automática e transparente.
    *   **Cron Interno do Container:** Ao iniciar o container, o script `scripts/export-env.js` extrai as variáveis do `.env` (onde o GitHub Actions injetou os segredos de produção) e as repassa para `/etc/environment` para que o serviço `cron` as herde. Em seguida, o daemon do `cron` é iniciado no background executando as regras do arquivo `cron-jobs`. A saída das chamadas curl (logs) é redirecionada para `/proc/1/fd/1`, aparecendo diretamente nos logs normais do container (`docker logs`).
6.  **Pruning:** Remove imagens não utilizadas para liberar espaço no servidor.

### 📋 Checklist de Variáveis do GitHub no Repositório

Para que o deploy funcione corretamente, as seguintes credenciais devem estar configuradas nas configurações do repositório no GitHub:

#### GitHub Variables (`Settings > Secrets and variables > Actions > Variables`):
*   `AZURE_ACR_USERNAME_PROD`: Usuário de acesso ao Azure Container Registry.
*   `PORTAINER_USER_PROD`: Usuário administrador no Portainer.

#### GitHub Secrets (`Settings > Secrets and variables > Actions > Secrets`):
*   `AZURE_ACR_PASSWORD_PROD`: Senha de acesso ao Azure Container Registry.
*   `AZURE_ACR_AUTH_B64`: Token de registro do Docker no Azure (em base64).
*   `PORTAINER_PASS_PROD`: Senha do usuário administrador no Portainer.
*   `ENV_PROD_TURSO_AUTH_TOKEN`: Token de autenticação do banco Turso.
*   `ENV_PROD_JWT_SECRET`: Chave secreta criptográfica de pelo menos 32 caracteres para assinatura dos tokens JWT.
*   `ENV_PROD_BLOB_READ_WRITE_TOKEN`: Token de leitura/escrita do Vercel Blob.
*   `AZURE_SMTP_MAILER_DSN`: String de conexão SMTP para envio de e-mails (ex: `smtp://smtp.azurecomm.net:587?encryption=tls&username=seu_usuario&password=sua_senha`).
*   `ENV_PROD_API_FOOTBALL_KEY`: Chave da API-Football para resultados ao vivo.
*   `ENV_PROD_CRON_SECRET`: Hash secreto para proteção de rotas de cron.
*   `ENV_PROD_ADMIN_PASSWORD`: Senha do administrador inicial no seed.
