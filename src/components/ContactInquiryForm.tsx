"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { InstagramLink } from "./InstagramLink";
import {
  createEventId,
  hasAdvertisingConsent,
  trackLead,
} from "@/lib/analytics";
import { siteConfig } from "@/lib/site";
import styles from "./ContactInquiryForm.module.css";

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  location: string;
  projectType: string;
  stage: string;
  message: string;
};

type MeetingState = {
  date: string;
  time: string;
  timezone: string;
  notes: string;
};

type MeetingReason =
  | "project"
  | "studio"
  | "collaboration"
  | "press"
  | "other";

type Step =
  | "idle"
  | "reason"
  | "form"
  | "meeting"
  | "inquiryDone"
  | "done";
type FormOrigin = "project" | "meeting";

const MEETING_REASONS = [
  "project",
  "studio",
  "collaboration",
  "press",
  "other",
] as const satisfies readonly MeetingReason[];

const INITIAL: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  location: "",
  projectType: "",
  stage: "",
  message: "",
};

const INITIAL_MEETING: MeetingState = {
  date: "",
  time: "",
  timezone: "",
  notes: "",
};

function detectedTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
}

type Props = {
  studioEmail: string;
  embedded?: boolean;
  initialProjectType?: "residence" | "hospitality";
};

type Attribution = {
  language: string;
  landingPage: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  referrer: string;
  source: string;
};

const EMPTY_ATTRIBUTION: Attribution = {
  language: "",
  landingPage: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  referrer: "",
  source: "direct",
};

export function ContactInquiryForm({
  studioEmail,
  embedded = false,
  initialProjectType,
}: Props) {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const shouldOpenForm = searchParams.get("start") === "1";
  const shouldOpenMeeting = searchParams.get("meeting") === "1";

  const [step, setStep] = useState<Step>(
    embedded || shouldOpenForm
      ? "form"
      : shouldOpenMeeting
        ? "reason"
        : "idle",
  );
  const [formOrigin, setFormOrigin] = useState<FormOrigin>(
    embedded || shouldOpenForm ? "project" : "meeting",
  );
  const [fromInquiry, setFromInquiry] = useState(false);
  const [meetingReason, setMeetingReason] = useState<MeetingReason | null>(
    null,
  );
  const [values, setValues] = useState<FormState>(() => ({
    ...INITIAL,
    projectType: initialProjectType ?? "",
  }));
  const [meeting, setMeeting] = useState<MeetingState>(INITIAL_MEETING);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attribution, setAttribution] =
    useState<Attribution>(EMPTY_ATTRIBUTION);
  const [formStartedAt] = useState(() => Date.now());

  useEffect(() => {
    const timezone = detectedTimezone();
    if (timezone) {
      setMeeting((current) =>
        current.timezone ? current : { ...current, timezone },
      );
    }
  }, []);

  useEffect(() => {
    const referrer = document.referrer;
    let source = searchParams.get("utm_source") || "";
    if (!source && referrer) {
      try {
        source = new URL(referrer).hostname;
      } catch {
        source = "referral";
      }
    }
    setAttribution({
      language: locale,
      landingPage: window.location.href,
      utm_source: searchParams.get("utm_source") || "",
      utm_medium: searchParams.get("utm_medium") || "",
      utm_campaign: searchParams.get("utm_campaign") || "",
      utm_content: searchParams.get("utm_content") || "",
      utm_term: searchParams.get("utm_term") || "",
      referrer,
      source: source || "direct",
    });
  }, [locale, searchParams]);

  const projectTypes = useMemo(
    () =>
      [
        "residence",
        "hospitality",
        "development",
        "masterplan",
        "other",
      ] as const,
    [],
  );

  const stages = useMemo(
    () =>
      [
        "exploring",
        "siteAcquired",
        "concept",
        "designInProgress",
        "constructionPlanning",
      ] as const,
    [],
  );
  const minMeetingDate = useMemo(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateMeeting<K extends keyof MeetingState>(
    key: K,
    value: MeetingState[K],
  ) {
    setMeeting((current) => ({ ...current, [key]: value }));
  }

  function appendContext(payload: FormData) {
    for (const [key, value] of Object.entries(attribution)) {
      payload.set(key, value);
    }
  }

  async function postContact(payload: FormData) {
    payload.set("formStartedAt", String(formStartedAt));
    appendContext(payload);
    const response = await fetch("/api/contact", {
      method: "POST",
      body: payload,
    });
    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      code?: string;
      accepted?: boolean;
    } | null;
    if (!response.ok || !data?.ok) {
      if (data?.code === "LOCAL_ATTACHMENT_UNSUPPORTED") {
        throw new Error(t("attachmentLocalError"));
      }
      throw new Error(data?.error || t("sendError"));
    }
    return { accepted: data.accepted === true };
  }

  async function handleInquirySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSending(true);

    try {
      const formEl = event.currentTarget;
      const honeypot = String(new FormData(formEl).get("website") ?? "");
      const payload = new FormData();
      payload.set("kind", "inquiry");
      payload.set("website", honeypot);
      payload.set("name", values.name);
      payload.set("email", values.email);
      payload.set("whatsapp", values.whatsapp);
      payload.set("location", values.location);
      payload.set("projectType", values.projectType);
      payload.set("stage", values.stage);
      payload.set("message", values.message);
      const eventId = createEventId();
      payload.set("eventId", eventId);
      payload.set(
        "advertisingConsent",
        hasAdvertisingConsent() ? "granted" : "denied",
      );
      const result = await postContact(payload);
      if (result.accepted) {
        trackLead(eventId);
      }
      setFromInquiry(true);
      setStep(embedded ? "inquiryDone" : "meeting");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sendError"));
    } finally {
      setSending(false);
    }
  }

  async function handleMeetingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSending(true);

    try {
      const formEl = event.currentTarget;
      const honeypot = String(new FormData(formEl).get("website") ?? "");
      const payload = new FormData();
      payload.set("kind", "meeting");
      payload.set("website", honeypot);
      payload.set("name", values.name);
      payload.set("email", values.email);
      payload.set("whatsapp", values.whatsapp);
      payload.set("date", meeting.date);
      payload.set("time", meeting.time);
      payload.set("timezone", meeting.timezone);
      payload.set("notes", meeting.notes);
      payload.set("fromInquiry", fromInquiry ? "1" : "0");
      if (meetingReason) {
        payload.set("reason", t(`meeting.reasons.${meetingReason}`));
      }
      await postContact(payload);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sendError"));
    } finally {
      setSending(false);
    }
  }

  function openMeetingDirect() {
    setFromInquiry(false);
    setMeetingReason(null);
    setFormOrigin("meeting");
    setStep("reason");
  }

  function selectMeetingReason(reason: MeetingReason) {
    setMeetingReason(reason);
    setFromInquiry(false);
    if (reason === "project") {
      setFormOrigin("meeting");
      setStep("form");
      return;
    }
    setStep("meeting");
  }

  function resetAll() {
    setValues({ ...INITIAL, projectType: initialProjectType ?? "" });
    setMeeting({ ...INITIAL_MEETING, timezone: detectedTimezone() });
    setError(null);
    setFromInquiry(false);
    setMeetingReason(null);
    setFormOrigin("project");
    setStep("idle");
  }

  function cancelForm() {
    if (formOrigin === "meeting") {
      setStep("reason");
      return;
    }
    setStep("idle");
  }

  function cancelMeeting() {
    if (fromInquiry) {
      setStep("inquiryDone");
      return;
    }
    if (meetingReason) {
      setStep("reason");
      return;
    }
    setStep("idle");
  }

  if (step === "inquiryDone") {
    return (
      <div className={styles.wrap}>
        <div className={styles.success} role="status" aria-live="polite">
          <p className={styles.successTitle}>{t("successTitle")}</p>
          <p>{t("successBody")}</p>
          {!embedded ? (
            <button type="button" className="btn btn-line" onClick={resetAll}>
              {t("sendAnother")}
            </button>
          ) : null}
        </div>
        {!embedded ? <ContactMeta studioEmail={studioEmail} /> : null}
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className={styles.wrap}>
        <div className={styles.success} role="status" aria-live="polite">
          <p>{t("meeting.done")}</p>
          <button type="button" className="btn btn-line" onClick={resetAll}>
            {t("sendAnother")}
          </button>
        </div>
        <ContactMeta studioEmail={studioEmail} />
      </div>
    );
  }

  if (step === "reason") {
    return (
      <div className={styles.wrap}>
        <div className={styles.reasonPrompt}>
          <h2 className={styles.meetingTitle}>{t("meeting.reasonTitle")}</h2>
          <p className={styles.meetingLead}>{t("meeting.reasonLead")}</p>
          <div className={styles.reasonList} role="list">
            {MEETING_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                role="listitem"
                className={styles.reasonOption}
                onClick={() => selectMeetingReason(reason)}
              >
                {t(`meeting.reasons.${reason}`)}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-line"
              onClick={() => setStep("idle")}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
        <ContactMeta studioEmail={studioEmail} />
      </div>
    );
  }

  if (step === "meeting") {
    const meetingForm = (
      <div className={styles.meetingPrompt}>
        <h2 className={styles.meetingTitle}>{t("meeting.title")}</h2>
        <p className={styles.meetingLead}>{t("meeting.lead")}</p>

        {meetingReason && !fromInquiry ? (
          <p className={styles.reasonBadge}>
            {t("meeting.fields.reason")}:{" "}
            {t(`meeting.reasons.${meetingReason}`)}
          </p>
        ) : null}

        {siteConfig.meetingUrl ? (
          <a
            className="btn btn-primary"
            href={siteConfig.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("meeting.openCalendar")}
          </a>
        ) : null}

        <form className={styles.form} onSubmit={handleMeetingSubmit}>
          {!fromInquiry ? (
            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>{t("fields.name")}</span>
                <input
                  className={styles.input}
                  name="name"
                  autoComplete="name"
                  required
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t("fields.email")}</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder={t("placeholders.email")}
                  value={values.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
            </div>
          ) : null}

          {!fromInquiry ? (
            <label className={styles.field}>
              <span className={styles.label}>{t("fields.whatsapp")}</span>
              <input
                className={styles.input}
                type="tel"
                name="whatsapp"
                autoComplete="tel"
                placeholder={t("placeholders.whatsapp")}
                value={values.whatsapp}
                onChange={(event) => update("whatsapp", event.target.value)}
              />
            </label>
          ) : null}

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>{t("meeting.fields.date")}</span>
              <input
                className={styles.input}
                type="date"
                name="meetingDate"
                min={minMeetingDate}
                required
                value={meeting.date}
                onChange={(event) => updateMeeting("date", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>{t("meeting.fields.time")}</span>
              <input
                className={styles.input}
                type="time"
                name="meetingTime"
                required
                value={meeting.time}
                onChange={(event) => updateMeeting("time", event.target.value)}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>
              {t("meeting.fields.timezone")}
            </span>
            <input
              className={styles.input}
              name="meetingTimezone"
              required
              placeholder={t("meeting.placeholders.timezone")}
              value={meeting.timezone}
              onChange={(event) =>
                updateMeeting("timezone", event.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t("meeting.fields.notes")}</span>
            <textarea
              className={styles.textarea}
              name="meetingNotes"
              placeholder={t("meeting.placeholders.notes")}
              value={meeting.notes}
              onChange={(event) => updateMeeting("notes", event.target.value)}
            />
          </label>

          <input
            className={styles.honeypot}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? t("meeting.sending") : t("meeting.submit")}
            </button>
            <button
              type="button"
              className="btn btn-line"
              onClick={cancelMeeting}
            >
              {fromInquiry ? t("meeting.skip") : t("cancel")}
            </button>
          </div>
          {error ? (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    );

    return (
      <div className={styles.wrap}>
        {fromInquiry ? (
          <div className={styles.success}>
            <div role="status" aria-live="polite">
              <p className={styles.successTitle}>{t("successTitle")}</p>
              <p>{t("successBody")}</p>
            </div>
            {meetingForm}
          </div>
        ) : (
          meetingForm
        )}
        <ContactMeta studioEmail={studioEmail} />
      </div>
    );
  }

  if (step === "idle") {
    return (
      <div className={styles.wrap}>
        <div className={styles.ctaRow}>
          <button
            type="button"
            className={`btn btn-primary ${styles.start}`}
            onClick={() => {
              setFormOrigin("project");
              setMeetingReason(null);
              setStep("form");
            }}
          >
            {t("cta")}
          </button>
          <button
            type="button"
            className={`btn btn-line ${styles.start}`}
            onClick={openMeetingDirect}
          >
            {t("ctaMeeting")}
          </button>
        </div>
        <ContactMeta studioEmail={studioEmail} />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {formOrigin === "meeting" ? (
        <div className={styles.formIntro}>
          <h2 className={styles.meetingTitle}>{t("meeting.projectTitle")}</h2>
          <p className={styles.meetingLead}>{t("meeting.projectLead")}</p>
        </div>
      ) : null}
      <form className={styles.form} onSubmit={handleInquirySubmit}>
        <ProjectInquiryFields
          values={values}
          update={update}
          projectTypes={projectTypes}
          stages={stages}
        />

        <input
          className={styles.honeypot}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? t("sending") : t("submit")}
          </button>
          {!embedded ? (
            <button type="button" className="btn btn-line" onClick={cancelForm}>
              {t("cancel")}
            </button>
          ) : null}
        </div>
        {error ? (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        ) : null}
      </form>
      {!embedded ? <ContactMeta studioEmail={studioEmail} /> : null}
    </div>
  );
}

type ProjectInquiryFieldsProps = {
  values: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  projectTypes: readonly string[];
  stages: readonly string[];
};

function ProjectInquiryFields({
  values,
  update,
  projectTypes,
  stages,
}: ProjectInquiryFieldsProps) {
  const t = useTranslations("Contact");

  return (
    <>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.name")}</span>
          <input
            className={styles.input}
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.email")}</span>
          <input
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder={t("placeholders.email")}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{t("fields.whatsapp")}</span>
        <input
          className={styles.input}
          type="tel"
          name="whatsapp"
          autoComplete="tel"
          placeholder={t("placeholders.whatsapp")}
          value={values.whatsapp}
          onChange={(event) => update("whatsapp", event.target.value)}
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.location")}</span>
          <input
            className={styles.input}
            name="location"
            required
            placeholder={t("placeholders.location")}
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.projectType")}</span>
          <select
            className={styles.select}
            name="projectType"
            required
            value={values.projectType}
            onChange={(event) => update("projectType", event.target.value)}
          >
            <option value="">{t("types.notSelected")}</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{t("fields.stage")}</span>
        <select
          className={styles.select}
          name="stage"
          value={values.stage}
          onChange={(event) => update("stage", event.target.value)}
        >
          <option value="">{t("stages.notSelected")}</option>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {t(`stages.${stage}`)}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{t("fields.message")}</span>
        <textarea
          className={styles.textarea}
          name="message"
          placeholder={t("placeholders.message")}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
        />
      </label>

    </>
  );
}

function ContactMeta({ studioEmail }: { studioEmail: string }) {
  const t = useTranslations("Contact");

  return (
    <div className={styles.meta}>
      <div className={styles.metaLine}>
        <a className={styles.email} href={`mailto:${studioEmail}`}>
          {studioEmail}
        </a>
        <span className={styles.sep} aria-hidden="true">
          ·
        </span>
        <span className={styles.instagram}>
          <InstagramLink muted large />
          <span className={styles.instagramLabel}>{t("instagramLabel")}</span>
        </span>
      </div>
    </div>
  );
}
