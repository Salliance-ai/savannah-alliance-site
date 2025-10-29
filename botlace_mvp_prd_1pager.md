### Product: Botlace MVP — AI Operating Layer for Clinics (90-Day Scope)

- **Vision**: Unify marketing, scheduling, clinical documentation, and revenue ops under one adaptive, compliant AI layer.
- **Beachhead**: Behavioral health and multisite outpatient clinics.

### Goals (Success Criteria)
- **G1**: Reduce provider note time by 40% with AI-generated drafts and ICD/CPT assist.
- **G2**: Increase appointment show rate by 10 percentage points via predictive scheduling and outreach.
- **G3**: Lift first-pass claim acceptance by 8 points through coding support and anomaly flags.
- **G4**: Deliver leadership KPIs (pipeline→visit→claim) in a single dashboard.

### Non-Goals (MVP)
- Full Epic/Athena write-back; federated learning; advanced RCM automation beyond anomaly detection; white-labeling; cross-region DR.

### Personas & Primary Workflows
- **Provider**: Finalizes AI-drafted note → reviews ICD/CPT suggestions → signs.
- **Front Desk**: Uses Smart Scheduling to fill gaps → reschedules at-risk no-shows.
- **Marketing Manager (GHL)**: Prioritizes leads via AI scoring → triggers nurture flows → books appointments.
- **Clinic Admin**: Monitors KPIs (utilization, show rate, claim status) → resolves exceptions.

### Scope (Functional)
- **ClinicalOps AI**: Real-time note drafts (SOAP-style), diagnosis/code suggestions; human-in-the-loop signoff; structured JSON outputs.
- **CareNav & Smart Scheduling**: Predictive fill (no-show risk), triage assistant, provider routing, outbound reminders.
- **MarketOps (GHL)**: OAuth app; lead scoring; pipeline stage webhooks; write-back tasks/appointment links.
- **RevenueOps (Lite)**: Billing anomaly flags; basic forecasting; export to QuickBooks/Athena (connector-ready).
- **Patient360 (Lite)**: Unified profile (clinical + engagement), last interactions, risk tags.

### Integrations & Data
- **GHL**: OAuth, webhooks (pipeline, conversations), write-backs (tasks/messages); rate-limit handling.
- **Tebra**: Scheduling + billing APIs; poll + webhook hybrid; reconcile to FHIR.
- **FHIR Store**: R4 resources (Patient, Appointment, Encounter, Condition, Observation, Claim); provenance + extensions for GHL linkage.
- **Stripe**: SaaS subscriptions (Starter/Practice/Enterprise), metered usage (notes, appointments, API calls).

### Architecture & Compliance (MVP)
- **ACRE**: FHIR-aware RAG + rules-verified coding outputs; explainability + audit trails.
- **SaaS Fabric**: Multitenant Postgres (RLS), per-tenant KMS keys, feature flags; SSO (OIDC), RBAC.
- **Security**: TLS1.2+, AES-256 at rest, private subnets, egress allowlisting; PHI redaction on egress; immutable logs.

### Metrics & Telemetry
- **North Stars**: note time, show rate, first-pass claims, provider utilization.
- **Leading Indicators**: lead→visit conversion, no-show risk precision/recall, coding suggestion acceptance rate.
- **Reliability**: API P95 < 300 ms; note generation P95 < 10 s; SLO 99.9%.

### Rollout & Acceptance
- **Phases**: (1) GHL + Scheduling; (2) Clinical note + coding; (3) RevenueOps Lite + KPIs.
- **Acceptance**: Achieve G1–G3 deltas on 2+ pilot clinics over 60–90 days; SOC 2 readiness checklist complete; zero P1 security findings.

### Risks & Mitigations
- **EHR variance**: Start read-only + incremental write; interface engine fallback.
- **LLM reliability**: Evals, dual-model fallback, human-in-the-loop signoff.
- **Identity linkage**: Deterministic matching + manual reconciliation queue.
