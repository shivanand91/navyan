import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TAG_OPTIONS = ["Hackathon", "Hiring", "Internship", "Challenge", "Announcement"];

const createEmptyForm = () => ({
  title: "",
  tag: "Hackathon",
  description: "",
  minTeamSize: "1",
  maxTeamSize: "4",
  registrationLink: "",
  isPublished: true
});

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/hackathons/admin");
      setHackathons(data.hackathons || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load hackathons.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setCoverImageFile(null);
    setCoverImagePreview("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("tag", form.tag);
    payload.append("description", form.description);
    payload.append("minTeamSize", form.minTeamSize);
    payload.append("maxTeamSize", form.maxTeamSize);
    payload.append("registrationLink", form.registrationLink);
    payload.append("isPublished", form.isPublished);

    if (coverImageFile) {
      payload.append("coverImage", coverImageFile);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Number(form.minTeamSize) > Number(form.maxTeamSize)) {
      toast.error("Minimum team size cannot be greater than maximum team size.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/hackathons/admin/${editingId}`, buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Hackathon updated successfully.");
      } else {
        await api.post("/hackathons/admin", buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Hackathon created successfully.");
      }

      resetForm();
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not save hackathon.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hackathon) => {
    setEditingId(hackathon._id);
    setForm({
      title: hackathon.title || "",
      tag: hackathon.tag || "Hackathon",
      description: hackathon.description || "",
      minTeamSize: String(hackathon.minTeamSize || 1),
      maxTeamSize: String(hackathon.maxTeamSize || 4),
      registrationLink: hackathon.registrationLink || "",
      isPublished: hackathon.isPublished !== false
    });
    setCoverImageFile(null);
    setCoverImagePreview(hackathon.coverImageUrl || "");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (hackathon) => {
    const shouldDelete = window.confirm(`Delete hackathon "${hackathon.title}"?`);
    if (!shouldDelete) return;

    setDeletingId(hackathon._id);
    try {
      const { data } = await api.delete(`/hackathons/admin/${hackathon._id}`);
      toast.success(data.message || "Hackathon deleted.");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete hackathon.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCoverImageFile(file);
    setCoverImagePreview(file ? URL.createObjectURL(file) : "");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hackathon Management</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Create, edit, and publish showcase cards. Choose a tag like Hackathon, Hiring, or Internship and it will appear on the homepage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="navyan-card grid gap-4 p-5 md:grid-cols-4">
        <Field label="Title">
          <Input name="title" value={form.title} onChange={handleChange} required />
        </Field>
        <Field label="Tag">
          <select
            name="tag"
            value={form.tag}
            onChange={handleChange}
            className="flex h-12 w-full rounded-[10px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-4 py-2 text-sm text-[color:var(--text)] transition focus-visible:border-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            {TAG_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Minimum Team Size">
          <select
            name="minTeamSize"
            value={form.minTeamSize}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2a2a36] dark:bg-[#161622] text-slate-900 dark:text-slate-100"
          >
            <option value="1">1 Person</option>
            <option value="2">2 People</option>
            <option value="3">3 People</option>
            <option value="4">4 People</option>
          </select>
        </Field>
        <Field label="Maximum Team Size">
          <select
            name="maxTeamSize"
            value={form.maxTeamSize}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2a2a36] dark:bg-[#161622] text-slate-900 dark:text-slate-100"
          >
            <option value="1">1 Person</option>
            <option value="2">2 People</option>
            <option value="3">3 People</option>
            <option value="4">4 People</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Registration Link / URL">
            <Input name="registrationLink" value={form.registrationLink} onChange={handleChange} placeholder="e.g. https://forms.gle/..." />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Cover Image">
            <Input type="file" accept="image/*" onChange={handleImageChange} required={!editingId} />
          </Field>
        </div>

        <div className="md:col-span-4">
          <Field label="Description">
            <Textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide a description of the hackathon, key dates, rules, etc."
              required
            />
          </Field>
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={form.isPublished}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-[#2a2a36] dark:bg-[#161622]"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Publish hackathon immediately
          </label>
        </div>

        {coverImagePreview ? (
          <div className="md:col-span-3">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Cover image preview</p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-[#2a2a36] dark:bg-[#16161f]">
                <img
                  src={coverImagePreview}
                  alt="Hackathon cover preview"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="md:col-span-4 flex items-end justify-end">
          <div className="flex gap-2">
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                  ? "Update Hackathon"
                  : "Create Hackathon"}
            </Button>
          </div>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active & Draft Hackathons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {hackathons.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No hackathons yet. Create your first hackathon.</p>
          ) : (
            hackathons.map((hackathon) => (
              <div
                key={hackathon._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-[#2a2a36] dark:bg-[#16161f]">
                    {hackathon.coverImageUrl ? (
                      <img
                        src={hackathon.coverImageUrl}
                        alt={hackathon.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-slate-500 dark:text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{hackathon.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tag: {hackathon.tag || "Hackathon"} · Team Size: {hackathon.minTeamSize}-{hackathon.maxTeamSize}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${hackathon.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {hackathon.isPublished ? "Published" : "Draft"}
                  </span>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(hackathon)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={deletingId === hackathon._id}
                    onClick={() => handleDelete(hackathon)}
                  >
                    {deletingId === hackathon._id ? "Deleting..." : "Delete"}
                  </Button>
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
      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
