# CollectIssuesSonar

Este projeto exporta issues do SonarQube para arquivos CSV.

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
     cp .env.example .env
     ```
   - Edite o arquivo `.env` com as informações do seu ambiente SonarQube.

4. **Execute o projeto:**
   ```sh
   npm run start
   ```

## Variáveis de ambiente necessárias

- `SONAR_HOST`: URL do servidor SonarQube (ex: https://sonar.seuservidor.com)
- `SONAR_TOKEN`: Token de autenticação do SonarQube
- `PROJECT_KEY`: Chave do projeto no SonarQube
- `BRANCH`: (opcional) Nome da branch a ser consultada

## Observações

- Os arquivos CSV gerados e o arquivo `.env` estão no `.gitignore` e não são enviados para o repositório.
- Certifique-se de que seu token SonarQube tem permissão para acessar o projeto e exportar issues.
