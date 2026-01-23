# CollectIssuesSonar

Este projeto é uma ferramenta para exportar issues (bugs e code smells) do SonarQube para arquivos CSV. Ele filtra issues abertas com severidade MAJOR ou CRITICAL e permite ordenação por prioridade ou componente.

## Funcionalidades

- Busca issues do SonarQube via API
- Filtra por tipos: BUG, CODE_SMELL
- Filtra por severidades: MAJOR, CRITICAL
- Filtra por status: OPEN
- Suporta ordenação por prioridade (padrão) ou por componente
- Gera arquivo CSV com os dados das issues

## Pré-requisitos

- Node.js (versão 16 ou superior)
- Acesso a um servidor SonarQube com token de autenticação

## Como iniciar o projeto em uma nova máquina

1. **Clone o repositório:**

   ```sh
   git clone git@github.com:ighortorquato/CollectIssuesSonar.git
   cd CollectIssuesSonar
   ```

2. **Instale as dependências:**

   ```sh
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   - Copie o arquivo `env.example` para `.env`:
     ```sh
     cp env.example .env
     ```
   - Edite o arquivo `.env` com as informações do seu ambiente SonarQube.

4. **Execute o projeto:**
   ```sh
   npm run start
   ```

## Scripts disponíveis

- `npm run start`: Executa o script diretamente com TypeScript
- `npm run build`: Compila o TypeScript para JavaScript
- `npm run run`: Executa a versão compilada (após build)

## Variáveis de ambiente necessárias

- `SONAR_HOST`: URL do servidor SonarQube (ex: https://sonar.seuservidor.com)
- `SONAR_TOKEN`: Token de autenticação do SonarQube
- `PROJECT_KEY`: Chave do projeto no SonarQube
- `BRANCH`: (opcional) Nome da branch a ser consultada (padrão: main)

## Uso

### Execução básica

```sh
npm run start
```

### Ordenação personalizada

Por prioridade (padrão: BUG > VULNERABILITY > CODE_SMELL, depois BLOCKER > CRITICAL > MAJOR, depois componente):

```sh
npm run start -- --order=priority
```

Por componente (alfabética):

```sh
npm run start -- --order=component
```

## Arquivos de saída

O script gera um arquivo CSV no formato `sonar-bugs-major-critical-{BRANCH}.csv` contendo as seguintes colunas:

- KEY: Chave única da issue
- TYPE: Tipo da issue (BUG ou CODE_SMELL)
- SEVERITY: Severidade (MAJOR ou CRITICAL)
- STATUS: Status (OPEN)
- COMPONENT: Componente do projeto
- LINE: Linha do código (se aplicável)
- MESSAGE: Mensagem da issue
- AUTHOR: Autor (se disponível)
- CREATION_DATE: Data de criação
- BRANCH: Nome da branch

## Observações

- Os arquivos CSV gerados e o arquivo `.env` estão no `.gitignore` e não são enviados para o repositório.
- Certifique-se de que seu token SonarQube tem permissão para acessar o projeto e exportar issues.
- O script busca todas as issues paginadas (500 por página) até esgotar os resultados.
