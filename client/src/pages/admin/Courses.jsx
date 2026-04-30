import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const createEmptyForm = () => ({
  title: "",
  slug: "",
  category: "",
  level: "",
  durationLabel: "",
  shortDescription: "",
  youtubeUrl: "",
  isPublished: true
});

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/courses/admin");
      setCourses(data.courses || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load courses admin.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/courses/admin/${editingId}`, form);
        toast.success("Course updated.");
      } else {
        await api.post("/courses/admin", form);
        toast.success("Course created.");
      }

      resetForm();
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not save course.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title || "",
      slug: course.slug || "",
      category: course.category || "",
      level: course.level || "",
      durationLabel: course.durationLabel || "",
      shortDescription: course.shortDescription || "",
      youtubeUrl: course.youtubeUrl || "",
      isPublished: course.isPublished !== false
    });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (course) => {
    const shouldDelete = window.confirm(`Remove "${course.title}" from live course listings?`);
    if (!shouldDelete) return;

    setDeletingId(course._id);
    try {
      await api.delete(`/courses/admin/${course._id}`);
      toast.success("Course removed from live listings.");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete course.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Courses management</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Publish NAVYAN learning content using YouTube URLs. The public Courses page will render
          the embedded videos directly from the backend-managed records.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="navyan-card grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Course title">
          <Input name="title" value={form.title} onChange={handleChange} />
        </Field>
        <Field label="Slug">
          <Input name="slug" value={form.slug} onChange={handleChange} />
        </Field>
        <Field label="Category">
          <Input name="category" value={form.category} onChange={handleChange} placeholder="Frontend / Web Development" />
        </Field>
        <Field label="Level">
          <Input name="level" value={form.level} onChange={handleChange} placeholder="Beginner / Intermediate" />
        </Field>

        <Field label="Duration label">
          <Input name="durationLabel" value={form.durationLabel} onChange={handleChange} placeholder="2 Hours / 5 Lessons" />
        </Field>
        <div className="md:col-span-3">
          <Field label="YouTube URL">
            <Input
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>
        </div>

        <div className="md:col-span-4">
          <Field label="Short description">
            <Textarea
              name="shortDescription"
              rows={4}
              value={form.shortDescription}
              onChange={handleChange}
            />
          </Field>
        </div>

        <div className="md:col-span-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-[#d7deea]">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
              className="h-4 w-4 rounded border border-[color:var(--border)]"
            />
            Publish immediately
          </label>

          <div className="flex gap-2">
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update course" : "Create course"}
            </Button>
          </div>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Published and managed courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {courses.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No courses yet. Create the first learning track.
            </p>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {course.category ? (
                        <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                          {course.category}
                        </span>
                      ) : null}
                      {course.level ? (
                        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-[#d7deea]">
                          {course.level}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-semibold text-secondary">
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div>
                      <p className="font-display text-xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                        {course.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                        {course.shortDescription || "Structured NAVYAN course."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-[#7e8794]">
                      {course.durationLabel ? <span>{course.durationLabel}</span> : null}
                      {course.durationLabel && course.watchUrl ? <span>•</span> : null}
                      {course.watchUrl ? (
                        <a href={course.watchUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary">
                          Open YouTube
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(course)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={deletingId === course._id}
                      onClick={() => handleDelete(course)}
                    >
                      {deletingId === course._id ? "Removing..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
