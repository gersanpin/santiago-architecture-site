"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { InstagramLink } from "./InstagramLink";
import { siteConfig } from "@/lib/site";
import styles from "./ContactInquiryForm.module.css";

type FormState = {
  name: string;
  contact: string;
  location: string;
  projectType: string;
  area: string;
  hasSite: string;
  stage: string;
  message: string;
};

type MeetingState = {
  date: string;
  time: string;
  notes: string;
};

type MeetingReason =
  | "project"
  | "studio"
  | "collaboration"
  | "press"
  | "other";

type Step = "idle" | "reason" | "form" | "meeting" | "done";
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
  contact: "",
  location: "",
  projectType: "residential",
  area: "",
  hasSite: "yes",
  stage: "idea",
  message: "",
};

const INITIAL_MEETING: MeetingState = {
  date: "",
  time: "",
  notes: "",
};

type Props = {
  studioEmail: string;
};

export function ContactInquiryForm({ studioEmail }: Props) {
  const t = useTranslations("Contact");
  const searchParams = useSearchParams();
  const shouldOpenForm = searchParams.get("start") === "1";
  const shouldOpenMeeting = searchParams.get("meeting") === "1";

  const [step, setStep] = useState<Step>(
    shouldOpenForm ? "form" : shouldOpenMeeting ? "reason" : "idle",
  );
  const [formOrigin, setFormOrigin] = useState<FormOrigin>(
    shouldOpenForm ? "project" : "meeting",
  );
  const [fromInquiry, setFromInquiry] = useState(false);
  const [meetingReason, setMeetingReason] = useState<MeetingReason | null>(
    null,
  );
  const [values, setValues] = useState<FormState>(INITIAL);
  const [meeting, setMeeting] = useState<MeetingState>(INITIAL_MEETING);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formStartedAt] = useState(() => Date.now());

  const projectTypes = useMemo(
    () =>
      [
        "residential",
        "hospitality",
        "development",
        "masterplan",
        "other",
      ] as const,
    [],
  );

  const stages = useMemo(
    () => ["idea", "siteAcquired", "design", "construction"] as const,
    [],
  );

  const hasSiteOptions = useMemo(
    () => ["yes", "no", "unsure"] as const,
    [],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateMeeting<K extends keyof MeetingState>(
    key: K,
    value: MeetingState[K],
  ) {
    setMeeting((current) => ({ ...current, [key]: value }));
  }

  async function postContact(payload: FormData) {
    payload.set("formStartedAt", String(formStartedAt));
    const response = await fetch("/api/contact", {
      method: "POST",
      body: payload,
    });
    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || t("sendError"));
    }
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
      payload.set("contact", values.contact);
      payload.set("location", values.location);
      payload.set("projectType", values.projectType);
      payload.set("area", values.area);
      payload.set("hasSite", values.hasSite);
      payload.set("stage", values.stage);
      payload.set("message", values.message);
      for (const file of attachments) {
        payload.append("attachments", file);
      }
      await postContact(payload);
      setFromInquiry(true);
      setStep("meeting");
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
      payload.set("contact", values.contact);
      payload.set("date", meeting.date);
      payload.set("time", meeting.time);
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
    setValues(INITIAL);
    setMeeting(INITIAL_MEETING);
    setAttachments([]);
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
      setStep("done");
      return;
    }
    if (meetingReason) {
      setStep("reason");
      return;
    }
    setStep("idle");
  }

  if (step === "done") {
    return (
      <div className={styles.wrap}>
        <div className={styles.success}>
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
                <span className={styles.label}>{t("fields.contact")}</span>
                <input
                  className={styles.input}
                  name="contact"
                  autoComplete="email"
                  required
                  placeholder={t("placeholders.contact")}
                  value={values.contact}
                  onChange={(event) => update("contact", event.target.value)}
                />
              </label>
            </div>
          ) : null}

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>{t("meeting.fields.date")}</span>
              <input
                className={styles.input}
                type="date"
                name="meetingDate"
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
          {error ? <p className={styles.formError}>{error}</p> : null}
        </form>
      </div>
    );

    return (
      <div className={styles.wrap}>
        {fromInquiry ? (
          <div className={styles.success}>
            <p>{t("success")}</p>
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
          hasSiteOptions={hasSiteOptions}
          onAttachmentsChange={setAttachments}
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
          <button type="button" className="btn btn-line" onClick={cancelForm}>
            {t("cancel")}
          </button>
        </div>
        {error ? <p className={styles.formError}>{error}</p> : null}
      </form>
      <ContactMeta studioEmail={studioEmail} />
    </div>
  );
}

type ProjectInquiryFieldsProps = {
  values: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  projectTypes: readonly string[];
  stages: readonly string[];
  hasSiteOptions: readonly string[];
  onAttachmentsChange: (files: File[]) => void;
};

function ProjectInquiryFields({
  values,
  update,
  projectTypes,
  stages,
  hasSiteOptions,
  onAttachmentsChange,
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
          <span className={styles.label}>{t("fields.contact")}</span>
          <input
            className={styles.input}
            name="contact"
            autoComplete="email"
            required
            placeholder={t("placeholders.contact")}
            value={values.contact}
            onChange={(event) => update("contact", event.target.value)}
          />
        </label>
      </div>

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
            value={values.projectType}
            onChange={(event) => update("projectType", event.target.value)}
          >
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.area")}</span>
          <input
            className={styles.input}
            name="area"
            placeholder={t("placeholders.area")}
            value={values.area}
            onChange={(event) => update("area", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.hasSite")}</span>
          <select
            className={styles.select}
            name="hasSite"
            value={values.hasSite}
            onChange={(event) => update("hasSite", event.target.value)}
          >
            {hasSiteOptions.map((option) => (
              <option key={option} value={option}>
                {t(`hasSiteOptions.${option}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{t("fields.stage")}</span>
          <select
            className={styles.select}
            name="stage"
            value={values.stage}
            onChange={(event) => update("stage", event.target.value)}
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {t(`stages.${stage}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{t("fields.message")}</span>
        <textarea
          className={styles.textarea}
          name="message"
          required
          placeholder={t("placeholders.message")}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{t("fields.attachments")}</span>
        <input
          className={styles.file}
          type="file"
          name="attachments"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.zip,image/*,application/pdf"
          onChange={(event) => {
            const files = event.target.files;
            onAttachmentsChange(files ? Array.from(files) : []);
          }}
        />
        <span className={styles.hint}>{t("attachmentNote")}</span>
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
