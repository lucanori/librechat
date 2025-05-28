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

## Task 2: Migrate Web Search from External Services to Self-Hosted SearXNG

**Goal:** Replace the current web search setup (Serper, Firecrawl, Jina/Cohere) with a self-hosted SearXNG instance, accessible via its JSON API, and configurable via a `SEARXNG_URL` environment variable.

**Sub-task 2.1: Add and Configure SearXNG Service in Docker Compose**
*   **Action:** Define a new `searxng` service in `docker-compose.yml`.
    *   Use an official SearXNG Docker image (e.g., `searxng/searxng`).
    *   Map a volume for SearXNG settings (e.g., `./searxng_config:/etc/searxng`).
    *   Create a `settings.yml` file in the host's `./searxng_config` directory. Ensure this `settings.yml` includes `server:` `enable_json_response: true` (and any other desired SearXNG configurations, like a `secret_key` and enabled search engines).
    *   Ensure the service is on the same Docker network as the `api` service.
    *   Internally expose SearXNG's port (e.g., 8080).
*   **Files to modify:** `docker-compose.yml`.
*   **Files to create:** `searxng_config/settings.yml`.

**Sub-task 2.2: Configure LibreChat API Service for SearXNG**
*   **Action:** Modify the `api` service definition in `docker-compose.yml`.
    *   Add `searxng` to the `depends_on` list for the `api` service.
    *   Add the `SEARXNG_URL` environment variable to the `api` service, pointing to the internal SearXNG search endpoint (e.g., `SEARXNG_URL=http://searxng:8080/search`).
*   **Files to modify:** `docker-compose.yml`.

**Sub-task 2.3: Update Environment Configuration (`.env` and `.env.example`)**
*   **Action:**
    *   In the project's `.env` file:
        *   Remove or comment out `SERPER_API_KEY`, `FIRECRAWL_API_KEY`, `FIRECRAWL_API_URL` (if used), `JINA_API_KEY`, `COHERE_API_KEY`.
        *   Add `SEARXNG_URL=http://searxng:8080/search` (or the user-configured value).
    *   In the `.env.example` file:
        *   Comment out or remove lines for `SERPER_API_KEY`, `FIRECRAWL_API_KEY`, etc.
        *   Add an entry like `# SEARXNG_URL=http://localhost:8080/search` (or `http://searxng:8080/search`).
*   **Files to modify:** `.env`, `.env.example`.

**Sub-task 2.4: LibreChat Application Code Adjustments for SearXNG API**
*   **Action:** Ensure the LibreChat application code that handles web search:
    *   Uses the `SEARXNG_URL` environment variable.
    *   Makes GET requests to this URL.
    *   Appends necessary query parameters, especially `format=json` and the user's query (e.g., `q={user_query}`). Other parameters like `categories` or `pageno` can be considered.
    *   Correctly parses the JSON response from SearXNG.
*   **Files to potentially modify:** Specific files in `api/` responsible for web search integration.

**Sub-task 2.5: Documentation Updates**
*   **Action:** Update project documentation (`README.md`, setup guides, this plan file):
    *   Reflect removal of previous search providers.
    *   Detail SearXNG setup: `docker-compose.yml` service, `SEARXNG_URL` variable, and the critical `enable_json_response: true` in `searxng_config/settings.yml`.
    *   Mention the API interaction: GET to `/search` with `format=json`.
*   **Files to modify:** `README.md`, other docs, `ONERING_MIGRATION_PLAN.md`.

**Sub-task 2.6: Testing**
*   **Action:**
    *   Restart Docker Compose stack.
    *   Verify SearXNG container starts, logs show `enable_json_response` is active.
    *   Test web search in LibreChat.
    *   Inspect network requests from LibreChat `api` to SearXNG to confirm correct URL and parameters.
    *   Check `api` and `searxng` logs.

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
- web search usiamo firecrawl in locale con container docker
- aggiungere barra laterale a sinistra con funzioni (guardare funzioni one ring)
- come provider api di modelli usiamo openrouter, ma riutilizziamo i componenti per suddividere in categorie gli altri provider che vengono usati attraverso openrouter
- sezione generazione immagini non avanzata con provider flux, imagen 
- speech to text con groq
- deepsearch con sonar usando openrouter, dropdown difianco a reasoning, stesso stile per i link
- filtrare paramentri agente, costruttore agente
- nascondere prompt custom e segnalibri
- aggiungere tabelle per costi chiamate api, poi creare hook, una volta rispsota da openrouter, prendere message id di openrouter e chiedere a openrouter il prezzo di quel message. dopo viene inserito nel db
- segnare nel db per ogni messaggio il message id di openrouter per fare check del prezzo veritiero e finale del costo mensile
- tabella dei costi sarà divisa per utente (usando appunto i message id salvati nel db e associati al singolo utente)
- costo totale chat nella preview

DA FARE SUCCESSIVAMENTE ALL'MVP:
- cambiare da meilisearch a typesense
- utente può cambiare il provider e il modello dell'embedding
- richiamare il file con la @ per usare il contesto del file (con ACL seria settata per ogni file)
- sezione generazione video
- refactor da js a typescript
- dockerfile rifatto seguendo home operation repo