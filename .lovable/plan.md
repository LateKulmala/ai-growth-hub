## Tavoite

Lisätä Supabaseen tarkalleen käyttäjän antama sisältö (profiili, taidot, projektit, agentit, oppimispäiväkirja, AI-opit) suomeksi. Ei keksitä mitään lisää, ei täytetä tyhjää.

## Toteutustapa

Käytetään `supabase--insert`-työkalua suoraan — yksi SQL-skripti per taulu. **Ei** rakenneta seed-nappia eikä `scripts/seed-data.ts`-tiedostoa, koska se on kertaluonteinen datansyöttö ja sovelluksessa on jo täysi CRUD jolla dataa voi myöhemmin muokata. Tämä on nopeampi, turvallisempi ja jättää koodikannan koskemattomaksi.

## Vaiheet

1. **`profile`** — upsert yhden rivin: display_name, bio, focus_areas, tools, skills, strengths, development_goals, public_summary. learning_score=0, weekly_streak=0. Säilytetään olemassa olevat asetukset (n8n_webhook_url, telegram_*, daily_*) jos rivi jo on.

2. **`skills`** — 15 riviä (Prompt engineering … SEO-automaatio) annetuilla category/proficiency/notes.

3. **`projects`** — 7 riviä:
   - BoatBase.fi, LogiQly, AI Growth OS, BoatBase JARVIS, kilpailutamuuttosi.fi, Channel Clarity, Priima Flow.
   - Huom: BoatBase.fi:lle annetussa datassa on `value_created` kahdesti — yhdistetään ne yhdeksi kentäksi (ensimmäinen kuvaus + JARVIS-agenttiluettelo perään), ettei dataa katoa.
   - Tyhjäksi jätetyt kentät jätetään NULLiksi (esim. Priima Flow: ei demo_url/github_url/technologies; kilpailutamuuttosi.fi: ei github_url/demo_url).

4. **`agents`** — 6 riviä (WRITER, REPORTER, HUNTER, GUARDIAN, SHIELD, HERMES 2.0). Linkitetään `project_id` BoatBase JARVIS -projektiin subquerylla `(SELECT id FROM projects WHERE name = 'BoatBase JARVIS — Multi-Agent System')`.

5. **`learning_journal`** — 3 riviä päivämäärillä 2025-06-01, 2025-05-15, 2025-04-20.

6. **`ai_news`** — 5 oppia (`kind='lesson'`) annetuilla content/summary/scores/tags/discovered_at.

## Idempotenssi

- Profiili: `INSERT … ON CONFLICT` tai update jos rivi olemassa.
- Muut taulut: poistetaan ensin saman nimiset/päiväiset rivit ennen insertointia, ettei syöttöä ajettaessa toistuvasti synny duplikaatteja. (Käytännössä yhdellä ajolla tämä ei välttämättä toistu, mutta turvallisuussyistä.)

## Mitä EI tehdä

- Ei luoda uusia tauluja, ei migraatioita.
- Ei kosketa koodia (komponentit, reitit, client).
- Ei käännetä mitään englanniksi.
- Ei lisätä `experiments`, `daily_briefings`, `social_insights`, `agent_runs` tms. — käyttäjä ei antanut niihin sisältöä.

## Vahvistus

Lopuksi ajetaan `SELECT count(*)` per taulu (profile, skills, projects, agents, learning_journal, ai_news joissa kind='lesson') ja raportoidaan rivimäärät käyttäjälle.
