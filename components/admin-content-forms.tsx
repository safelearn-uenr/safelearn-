"use client";

import { useEffect, useState } from "react";
import { Check, FilePlus2, Plus, Video } from "lucide-react";
import { Course } from "@/lib/demo-data";
import { createLiveCourse, createLiveLesson } from "@/lib/live-data";

const DEMO_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

type Props = { courses: Course[]; onSavedAction: () => Promise<void> };

export function AdminContentForms({ courses, onSavedAction }: Props) {
  const [course, setCourse] = useState({ code: "", name: "", slug: "", description: "Simplifying complex courses for academic excellence.", price: "30" });
  const [lesson, setLesson] = useState({ courseId: "", title: "", module: "Module 01 / Foundations", duration: "", videoUrl: "", streamType: "placeholder" });
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lesson.courseId && courses[0]?.databaseId) setLesson((current) => ({ ...current, courseId: courses[0].databaseId ?? "" }));
  }, [courses, lesson.courseId]);

  const updateCourse = (key: keyof typeof course, value: string) => setCourse((current) => ({ ...current, [key]: value }));
  const updateLesson = (key: keyof typeof lesson, value: string) => setLesson((current) => ({ ...current, [key]: value }));

  const saveCourse = async () => {
    if (!course.name.trim() || !course.code.trim()) return setError("Course name and code are required.");
    setSavingCourse(true); setError(""); setNotice("");
    try {
      await createLiveCourse({ ...course, price: Number(course.price) || 0 });
      setCourse({ code: "", name: "", slug: "", description: "Simplifying complex courses for academic excellence.", price: "30" });
      await onSavedAction();
      setNotice("Course created. Add its first lesson below.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create the course."); }
    finally { setSavingCourse(false); }
  };

  const saveLesson = async () => {
    if (!lesson.courseId || !lesson.title.trim()) return setError("Choose a course and enter a lesson title.");
    setSavingLesson(true); setError(""); setNotice("");
    try {
      await createLiveLesson({ courseId: lesson.courseId, title: lesson.title, module: lesson.module, duration: lesson.duration, videoUrl: lesson.videoUrl, streamType: lesson.streamType });
      setLesson((current) => ({ ...current, title: "", duration: "", videoUrl: "", streamType: "placeholder" }));
      await onSavedAction();
      setNotice("Lesson added to the course.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not add the lesson."); }
    finally { setSavingLesson(false); }
  };

  const useDemoVideo = () => setLesson((current) => ({ ...current, videoUrl: DEMO_VIDEO_URL, streamType: "mp4", duration: "1 min demo" }));

  return <div className="admin-grid content-builder-grid">
    <section className="admin-panel">
      <div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />Content / new pathway</div><h2>Create course</h2></div><FilePlus2 size={22} className="panel-icon" /></div>
      <p className="panel-copy">Add a new paid course to the live catalogue. It will appear after you publish it here.</p>
      <div className="manager-editor">
        <label className="field-label">Course code<input value={course.code} onChange={(event) => updateCourse("code", event.target.value.toUpperCase())} placeholder="e.g. RS" /></label>
        <label className="field-label">Price (GHS)<input value={course.price} onChange={(event) => updateCourse("price", event.target.value)} inputMode="decimal" /></label>
        <label className="field-label">Course name<input value={course.name} onChange={(event) => updateCourse("name", event.target.value)} placeholder="e.g. Remote Sensing" /></label>
        <label className="field-label">URL slug<input value={course.slug} onChange={(event) => updateCourse("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="remote-sensing" /></label>
        <label className="field-label" style={{ gridColumn: "1 / -1" }}>Description<textarea value={course.description} onChange={(event) => updateCourse("description", event.target.value)} rows={3} /></label>
        <button className="primary-button" disabled={savingCourse} onClick={saveCourse}><Plus size={16} /> {savingCourse ? "Creating…" : "Create course"}</button>
      </div>
    </section>
    <section className="admin-panel quick-grant-panel">
      <div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />Content / lesson slot</div><h2>Add lesson</h2></div><Video size={22} className="panel-icon" /></div>
      <p className="panel-copy">Create a placeholder lesson now, or paste a short MP4/HLS URL to test the protected player.</p>
      <label className="field-label">Course<select value={lesson.courseId} onChange={(event) => updateLesson("courseId", event.target.value)}><option value="">Choose a course</option>{courses.filter((course) => course.databaseId).map((course) => <option key={course.databaseId} value={course.databaseId}>{course.name}</option>)}</select></label>
      <label className="field-label">Lesson title<input value={lesson.title} onChange={(event) => updateLesson("title", event.target.value)} placeholder="Lesson 1: Introduction" /></label>
      <div className="manager-editor">
        <label className="field-label">Module<input value={lesson.module} onChange={(event) => updateLesson("module", event.target.value)} /></label>
        <label className="field-label">Duration<input value={lesson.duration} onChange={(event) => updateLesson("duration", event.target.value)} placeholder="12 min" /></label>
      </div>
      <label className="field-label">Video type<select value={lesson.streamType} onChange={(event) => updateLesson("streamType", event.target.value)}><option value="placeholder">Coming soon / no video yet</option><option value="mp4">Short MP4 test video</option><option value="hls">Bunny / Cloudflare HLS</option></select></label>
      <label className="field-label">Video URL<input value={lesson.videoUrl} onChange={(event) => updateLesson("videoUrl", event.target.value)} placeholder="https://…" /></label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="secondary-button" onClick={useDemoVideo}><Video size={15} /> Use short demo video</button><button className="primary-button" disabled={savingLesson || !lesson.courseId} onClick={saveLesson}><Check size={16} /> {savingLesson ? "Adding…" : "Add lesson"}</button></div>
      <div className="grant-note"><Check size={15} /> The demo clip is public and only for testing. Replace it with your protected stream URL before launch.</div>
    </section>
    {(notice || error) && <div className={error ? "toast" : "toast"} role="status">{error || notice}</div>}
  </div>;
}
