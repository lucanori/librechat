# Overall Project Plan

## Task 1: Migrate from Locize to Direct File-Based Translations

**Goal:** Transition from Locize-managed translations to a system where `client/src/locales/[lang]/translation.json` files are the source of truth, updated manually and committed directly to the repository.

**Phases & Steps:**

**Phase 1.1: Preparation & Disconnection from Locize**
1.  **Final Synchronization (Critical):**
    *   **Action:** Perform a final, complete synchronization from the Locize platform to your local repository.
    *   **Purpose:** Ensure all `client/src/locales/[lang]/translation.json` files contain the absolute latest translations from Locize before disconnecting.
    *   **Verification:** Manually inspect key translation files.
2.  **Disable Locize Platform Integration:**
    *   **Action:** In Locize project settings, disable/remove configurations syncing to `client/src/locales/[lang]/`.
    *   **Purpose:** Stop Locize from altering local files.

**Phase 1.2: Documentation & Project Structure Updates**
1.  **Update Root `README.md`:**
    *   **Action 1.2.1.1:** Remove Locize translation progress badge.
    *   **Action 1.2.1.2:** Update/remove "Special Thanks" for Locize.
    *   **Action 1.2.1.3:** Review/update "Translation Guide" link if it points to Locize-specifics.
2.  **Update `PROJECT_STRUCTURE.md`:**
    *   **Action 1.2.2.1:** Remove mentions of Locize managing/syncing UI translations.
    *   **Action 1.2.2.2:** Clarify `client/src/locales/[lang]/translation.json` are manually managed in-repo.
    *   **Action 1.2.2.3:** Note that `config/translations/` script descriptions are pending review (see Phase 1.3, Step 3).
3.  **Update `config/translations/README.md`:**
    *   **Action:** Add a note stating its workflow is under review due to Locize migration and manual updates for `client/src/locales/[lang]/translation.json`. Future script utility TBD (see Phase 1.3, Step 3).

**Phase 1.3: Workflow Adjustment & Future Decisions**
1.  **Establish and Document Manual Translation Workflow:**
    *   **Action:** Create/update internal docs on locating, editing `client/src/locales/[lang]/translation.json`, and committing changes.
2.  **Final Codebase Check (Confirmation):**
    *   **Action:** Global codebase search for "locize" to find any missed references.
3.  **To Be Done (TBD): Revisit and Decide on `config/translations/` Scripts:**
    *   **Action:** Later, evaluate `config/translations/` scripts (e.g., `scan.ts`).
    *   **Considerations:** Utility for bootstrapping/drafts, deprecation, or adaptation.
    *   **Outcome:** Update `config/translations/README.md`, remove/modify scripts, update `PROJECT_STRUCTURE.md` references.

**Phase 1.4: Verification & Testing**
1.  **Application Testing:**
    *   **Action:** Test UI in all languages, check for errors after changes (excluding TBD script decision).
2.  **Test Manual Update Process:**
    *   **Action:** Simulate a manual translation update and verify it in the UI.

---

## Task 2: Integrate `web2md` for Advanced Web Search

**Goal:** Replace all current web search functionalities with a new integrated system composed of `web2md` (`ghcr.io/lucanori/web2md:rolling`), `SearXNG`, and `Browserless`, targeting the development environment. This system will implement a multi-step process: the chat model generates search queries, `web2md` fetches and converts relevant web content to Markdown using these queries (and its own configurable model), and this Markdown augments the user's original message as context for the final AI response. All Docker Compose changes will be made in [`docker-compose.dev.yml`](docker-compose.dev.yml), adhering to guidelines in [`DEVELOPMENT.md`](DEVELOPMENT.md).

**Sub-task 2.1: Docker Compose Configuration for Web Search Stack (in [`docker-compose.dev.yml`](docker-compose.dev.yml))**
1.  **Define `searxng` Service:**
    *   **Action:** In [`docker-compose.dev.yml`](docker-compose.dev.yml), define the `searxng` service.
        *   `container_name: searxng-dev`
        *   `image: docker.io/searxng/searxng:latest`
        *   `restart: unless-stopped`
        *   `ports: ["8080:8080"]` (Adjust host port if 8080 is in use, ensure internal port is 8080)
        *   `volumes: ["./searxng:/etc/searxng:rw"]` (User must provide `settings.yml` and `limiter.toml` in the local `./searxng` directory. The `settings.yml` must be configured by the user to include `server: enable_json_response: true` if `web2md` relies on SearXNG's JSON output, alongside other engine configurations.)
        *   Ensure it's on the same Docker network as `api` and `web2md`.
    *   **Files to modify:** [`docker-compose.dev.yml`](docker-compose.dev.yml).
    *   **Files to create (user-provided):** User creates `./searxng/settings.yml` and `./searxng/limiter.toml`.
2.  **Define `browserless` Service:**
    *   **Action:** In [`docker-compose.dev.yml`](docker-compose.dev.yml), define the `browserless` service.
        *   `container_name: browserless-dev`
        *   `image: ghcr.io/browserless/chromium`
        *   `restart: unless-stopped`
        *   `ports: ["3000:3000"]` (Adjust host port if 3000 is in use)
        *   `environment:`
            *   `TOKEN=your_browserless_token_here` (User must replace with actual token for development)
            *   `MAX_CONCURRENT_SESSIONS=10`
            *   `TIMEOUT=60000`
            *   `QUEUED=10`
        *   Ensure it's on the same Docker network.
    *   **Files to modify:** [`docker-compose.dev.yml`](docker-compose.dev.yml).
3.  **Define `web2md` Service:**
    *   **Action:** In [`docker-compose.dev.yml`](docker-compose.dev.yml), define the `web2md` service.
        *   `container_name: web2md-dev`
        *   `image: ghcr.io/lucanori/web2md:rolling`
        *   `restart: unless-stopped`
        *   `ports: ["8001:8000"]` (Using 8001 on host to avoid conflict, internal port of `web2md` assumed to be 8000, confirm from `web2md` docs).
        *   `depends_on: [searxng, browserless]` (Referring to dev service names if they differ, e.g., `searxng-dev`, `browserless-dev`)
        *   `volumes: []` (Add any persistent volumes if `web2md` requires them).
        *   `environment:`
            *   `SEARXNG_URL=http://searxng-dev:8080` (If `web2md` needs to know where SearXNG is, using dev service name).
            *   `BROWSERLESS_URL=http://browserless-dev:3000` (Using dev service name).
            *   `BROWSERLESS_TOKEN=your_browserless_token_here` (If `web2md` needs the token directly).
            *   Any other specific environment variables required by `ghcr.io/lucanori/web2md:rolling`.
        *   Ensure it's on the same Docker network.
    *   **Files to modify:** [`docker-compose.dev.yml`](docker-compose.dev.yml).
4.  **Investigate `web2md` API and Configuration:**
    *   **Action:** Confirm the exact API endpoint(s) of `ghcr.io/lucanori/web2md:rolling` for initiating search/scraping, expected input (e.g., list of queries, original query), and output format (expected to be Markdown). Verify its internal port.
    *   **Purpose:** Essential for correct integration in Sub-task 2.4.

**Sub-task 2.2: Configure LibreChat API Service for New Web Search Stack (in [`docker-compose.dev.yml`](docker-compose.dev.yml))**
*   **Action:** Modify the `api` service definition in [`docker-compose.dev.yml`](docker-compose.dev.yml).
    *   Add `web2md` (referring to its dev service name, e.g., `web2md-dev`) to the `depends_on` list for the `api` service.
    *   Add necessary environment variables to the `api` service:
        *   `WEB2MD_URL=http://web2md-dev:8000/api/scrape` (Example endpoint, using dev service name, confirm actual from `web2md` docs).
        *   `NUM_WEB_SEARCH_QUERIES=3` (Default value, user-configurable).
        *   `WEB2MD_PROCESSING_MODEL_NAME=default_model` (Model used by `web2md` for choosing sites, user-configurable, confirm actual env var name from `web2md` docs).
*   **Files to modify:** [`docker-compose.dev.yml`](docker-compose.dev.yml).

**Sub-task 2.3: Update Environment Configuration (`.env.dev.example` and development `.env` file)**
*   **Action:**
    *   In the project's development `.env` file (e.g., a copy of [`.env.dev.example`](.env.dev.example) used for local development):
        *   Remove/comment out ALL previous search provider API keys and URLs.
        *   Add `WEB2MD_URL=http://web2md-dev:8000/api/scrape` (or the appropriate URL for local dev, matching the service name in `docker-compose.dev.yml`).
        *   Add `NUM_WEB_SEARCH_QUERIES=3`.
        *   Add `WEB2MD_PROCESSING_MODEL_NAME=default_model`.
        *   Add `BROWSERLESS_TOKEN=your_browserless_token_here` (for user reference, ensure this matches token in `browserless-dev` service).
    *   In the [`.env.dev.example`](.env.dev.example) file:
        *   Comment out or remove lines for all previous search provider keys and URLs.
        *   Add entries for new variables:
            *   `# WEB2MD_URL=http://web2md-dev:8000/api/scrape` (or `http://localhost:8001/api/scrape` if using host port)
            *   `# NUM_WEB_SEARCH_QUERIES=3`
            *   `# WEB2MD_PROCESSING_MODEL_NAME=default_model`
            *   `# BROWSERLESS_TOKEN="your_actual_token_for_browserless_service"`
*   **Files to modify:** Development `.env` file, [`.env.dev.example`](.env.dev.example).

**Sub-task 2.4: LibreChat Application Code Adjustments for New Web Search Flow**
*   **Action:** Overhaul the web search logic within the `api/` directory to implement the new multi-step process.
    1.  **Remove Obsolete Search Tool Integrations:**
        *   Delete specific search tool files: [`api/app/clients/tools/structured/GoogleSearch.js`](api/app/clients/tools/structured/GoogleSearch.js:43), [`TavilySearch.js`](api/app/clients/tools/structured/TavilySearch.js:12), [`AzureAISearch.js`](api/app/clients/tools/structured/AzureAISearch.js:81), [`TraversaalSearch.js`](api/app/clients/tools/structured/TraversaalSearch.js:42). Review and remove any others.
        *   In [`api/app/clients/tools/util/handleTools.js`](api/app/clients/tools/util/handleTools.js:142), remove all logic related to loading/configuring these deleted tools and the generic `createSearchTool` / `loadWebSearchAuth` pathways for SerpAPI, Firecrawl, etc. The concept of the AI model *calling* a search tool is being replaced.
    2.  **Implement New Orchestration Logic (likely in [`api/server/services/ToolService.js`](api/server/services/ToolService.js:186) or a new dedicated service):**
        *   **Step A: Conditional Execution:** If web search is enabled for the user's message:
        *   **Step B: Generate Search Queries:**
            *   Access `NUM_WEB_SEARCH_QUERIES` from environment variables.
            *   Make an LLM call using the *user-selected chat model* to generate `N` distinct search queries based on the user's original message/question.
        *   **Step C: Invoke `web2md`:**
            *   Access `WEB2MD_URL` and `WEB2MD_PROCESSING_MODEL_NAME`.
            *   Send the generated search queries (and potentially `WEB2MD_PROCESSING_MODEL_NAME` if `web2md` API supports it) to the `web2md` service.
            *   Receive the aggregated Markdown content from `web2md`.
        *   **Step D: Augment User's Original Message:**
            *   Prepend or append the collected Markdown from `web2md` to the user's original message text. This forms the new, augmented prompt.
        *   **Step E: Proceed with Final Answer Generation:**
            *   The augmented prompt is then passed to the user-selected chat model (e.g., via `AskController.js` using the `client.sendMessage(augmentedText, messageOptions)` pattern) to generate the final response.
    3.  **Client-Side Indication (Optional but Recommended):**
        *   Consider how to inform the client (UI) that web searching has occurred and potentially display the generated queries or sources used. This might involve adapting parts of the old `sendMessage` (SSE) logic in [`api/server/utils/streamResponse.js`](api/server/utils/streamResponse.js:23) or [`api/server/services/Tools/search.js`](api/server/services/Tools/search.js:10) to send special messages or metadata about the search process, even if the final Markdown is part of the main prompt.
*   **Files to modify/create:** [`api/server/services/ToolService.js`](api/server/services/ToolService.js:186) (major changes or new service), [`api/app/clients/tools/util/handleTools.js`](api/app/clients/tools/util/handleTools.js:142) (significant removal/simplification), [`api/server/controllers/AskController.js`](api/server/controllers/AskController.js:17) (to handle the augmented prompt), potentially new files for orchestration.

**Sub-task 2.5: Documentation Updates**
*   **Action:** Update all relevant project documentation:
    *   Main `README.md`, setup guides, [`PROJECT_STRUCTURE.md`](.task/PROJECT_STRUCTURE.md).
    *   Detail the new Docker Compose setup for `web2md`, `searxng`, and `browserless`.
    *   Clearly document all new environment variables: `WEB2MD_URL`, `NUM_WEB_SEARCH_QUERIES`, `WEB2MD_PROCESSING_MODEL_NAME`, and the user-provided `BROWSERLESS_TOKEN` for the `browserless` service.
    *   Explain the new multi-step web search flow: query generation, `web2md` processing, context augmentation.
    *   Instruct users on providing `./searxng/settings.yml` and `./searxng/limiter.toml`, and the importance of `enable_json_response: true` in `settings.yml` if applicable.
    *   Remove all references to old search providers and their API keys.
    *   Update this task description within [`.task/ONERING_MIGRATION_PLAN.md`](.task/ONERING_MIGRATION_PLAN.md) with any refined details from implementation.
*   **Files to modify:** `README.md`, other setup/developer guides, [`PROJECT_STRUCTURE.md`](.task/PROJECT_STRUCTURE.md), [`.task/ONERING_MIGRATION_PLAN.md`](.task/ONERING_MIGRATION_PLAN.md).

**Sub-task 2.6: Testing**
*   **Action:**
    *   Build/pull new Docker images and restart the full Docker Compose stack (`api`, `web2md`, `searxng`, `browserless`).
    *   Verify all containers start correctly and check their logs for errors.
    *   Confirm `web2md` can connect to `searxng` and `browserless`.
    *   Test the end-to-end web search flow in LibreChat:
        *   Enable web search.
        *   Send a query that should trigger it.
        *   Verify (e.g., through logs or debug output) that the chat model generates multiple queries.
        *   Verify `web2md` is called with these queries.
        *   Verify `web2md` returns Markdown.
        *   Verify the original user message is augmented with this Markdown before being sent to the chat model for the final answer.
        *   Inspect network requests between services.
    *   Check `api` service logs for errors throughout this new flow.

---

## Task 3: Rebrand Project from "LibreChat" to "One Ring"

**Goal:** Update all references of "LibreChat" (and its variants) to "One Ring" (display), "one-ring" (code/paths/slugs), "ONE_RING" (constants). Update GitHub repository target to `lucanori/one-ring`. Attempt a comprehensive rename of internal code identifiers. NPM package renaming is deferred.

**Sub-task 3.1: Finalize Rebranding Mappings & Detailed Strategy**
*   **Action:** Confirm and document explicit mappings:
    *   Display Name: "One Ring"
    *   Code/Paths/Slugs: "one-ring"
    *   Constants Prefix/Infix: "ONE_RING"
    *   GitHub Repository: `danny-avila/LibreChat` -> `lucanori/one-ring`
    *   Docker Image Namespace: `ghcr.io/danny-avila/` -> `ghcr.io/lucanori/` (e.g., `ghcr.io/lucanori/one-ring-api:latest`).
    *   Associated URLs (e.g., `librechat.ai`, `discord.librechat.ai`): Determine new URLs or update links to point to the new GitHub repo (`https://github.com/lucanori/one-ring`).
*   **Strategy for Code Renaming:** Plan for comprehensive rename of internal code identifiers (variables, functions, classes, file/directory names where feasible and not tied to deferred npm package names). Prioritize changes that are most visible or impactful.

**Sub-task 3.2: Update Configuration Files**
*   **Action:**
    *   `docker-compose.yml`: Update `container_name` (e.g., `one-ring-api`), `image` names (e.g., `ghcr.io/lucanori/one-ring-api:latest`), `MONGO_URI` database name (e.g., `mongodb://mongodb:27017/OneRing`).
    *   `.env.example` and `.env`: Update `APP_TITLE="One Ring"`, `MONGO_URI` (e.g., `mongodb://127.0.0.1:27017/OneRing`), `DOMAIN_CLIENT`, `DOMAIN_SERVER`, `EMAIL_FROM`, `HELP_AND_FAQ_URL`, and any other "LibreChat"-based values with their "One Ring" equivalents.
    *   `librechat.example.yaml` (and `librechat.yaml` if it exists): Update `APP_TITLE`, UI text (welcome messages, ToS modal title/content), URLs.
    *   `package.json` (root): Update `name` (e.g., "one-ring"), `description`, `repository.url` (to `git+https://github.com/lucanori/one-ring.git`), `bugs.url` (to `https://github.com/lucanori/one-ring/issues`), `homepage`. (Sub-package `package.json` files: update repo/bug URLs; name changes deferred).
    *   `Dockerfile`(s): Update `LABEL`s, internal references, and ensure final image is tagged for `ghcr.io/lucanori/one-ring-...`.

**Sub-task 3.3: Update Documentation Content**
*   **Action:** Systematically replace "LibreChat" with "One Ring", `librechat.ai` with new URLs (or update to new GitHub repo), `github.com/danny-avila/LibreChat` with `github.com/lucanori/one-ring`, and `discord.librechat.ai` if applicable, across all `.md` files and other textual documentation. Update image `src` paths if asset filenames change.

**Sub-task 3.4: Comprehensive Source Code Update (Identifiers, Strings, Paths)**
*   **Action:**
    *   Rename internal code identifiers (variables, function names, class names, constants, e.g., `LibreChatConfig` -> `OneRingConfig`, `LIBRECHAT_XYZ` -> `ONE_RING_XYZ`).
    *   Rename files and directories if their names include "librechat" and it's feasible (e.g., `api/src/librechatUtils/` -> `api/src/oneRingUtils/`). This should be done carefully to maintain import paths or update them accordingly.
    *   Update all user-facing strings in UI components and backend responses.
    *   Update translation files (`client/src/locales/**/*.json`) with new display names and any changed keys resulting from code renames.
    *   Update path aliases in `tsconfig.json` files or build scripts if they reference "librechat".
    *   Update any hardcoded URLs or string literals referencing "librechat" or its associated domains/paths.

**Sub-task 3.5: Update Build, Tooling, and CI/CD Configuration**
*   **Action:**
    *   `client/vite.config.ts`: Update `manifest.name` and `manifest.short_name` to "One Ring".
    *   `eslint.config.mjs`, `client/tsconfig.json`, other `tsconfig.json` files: Update path aliases if affected by file/directory renames in Sub-task 3.4.
    *   GitHub Actions (`.github/workflows/`): Update `actions/checkout` to use `lucanori/one-ring` if the repository is made public under that name before CI runs. Update steps that build/push Docker images to use new image names/tags (`ghcr.io/lucanori/one-ring-...`).

**Sub-task 3.6: Update Helm Charts**
*   **Action:**
    *   Rename directory `helm/librechat/` to `helm/one-ring/`.
    *   Update chart names, metadata (`Chart.yaml`), values (`values.yaml`), and templates within the Helm chart files to use "one-ring" and new image names.

**Sub-task 3.7: Update Brand Assets**
*   **Action:** Replace `client/public/assets/logo.svg`, favicons, and any other visual brand assets with new "One Ring" equivalents. Ensure paths in code/HTML are updated if filenames change.

**Sub-task 3.8: Testing and Validation**
*   **Action:**
    *   Perform full project build and ensure success.
    *   Deploy using Docker Compose; test all core functionalities extensively.
    *   If applicable, test Helm chart deployment.
    *   Review all UI elements and documentation for correct branding and links.
    *   Conduct thorough regression testing, paying close attention to areas affected by code renaming.
    *   Validate CI/CD pipeline if changes were made.

---

DA FARE PER MVP:
- [campo] aggiungere barra laterale a sinistra con funzioni (guardare funzioni one ring)
- [campo] come provider api di modelli usiamo openrouter, ma riutilizziamo i componenti per suddividere in categorie gli altri provider che vengono usati attraverso openrouter
- sezione generazione immagini non avanzata con provider flux, imagen 
- [luca] speech to text con groq
- [luca] deepsearch con sonar usando openrouter, dropdown difianco a reasoning, stesso stile per i link
- filtrare paramentri agente, costruttore agente
- nascondere prompt custom e segnalibri
- [campo] aggiungere tabelle per costi chiamate api, poi creare hook, una volta rispsota da openrouter, prendere message id di openrouter e chiedere a openrouter il prezzo di quel message. dopo viene inserito nel db
- [campo] segnare nel db per ogni messaggio il message id di openrouter per fare check del prezzo veritiero e finale del costo mensile
- [campo] tabella dei costi sarà divisa per utente (usando appunto i message id salvati nel db e associati al singolo utente)
- [campo] costo totale chat nella preview

DA FARE SUCCESSIVAMENTE ALL'MVP:
- cambiare da meilisearch a typesense
- utente può cambiare il provider e il modello dell'embedding
- richiamare il file con la @ per usare il contesto del file (con ACL seria settata per ogni file)
- sezione generazione video
- refactor da js a typescript
- dockerfile rifatto seguendo home operation repo