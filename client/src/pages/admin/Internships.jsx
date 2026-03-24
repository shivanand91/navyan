import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const createEmptyForm = () => ({
  title: "",
  slug: "",
  shortDescription: "",
  role: "",
  mode: "remote"
});

export default function AdminInternships() {
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/internships/admin");
      setInternships(data.internships || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/internships/admin/${editingId}`, {
          ...form,
          shortDescription: form.shortDescription
        });
        toast.success("Internship updated.");
      } else {
        await api.post("/internships/admin", {
          ...form,
          shortDescription: form.shortDescription,
          isPublished: true,
          durations: [
            { key: "4-weeks", label: "4 weeks", isPaid: false },
            { key: "3-months", label: "3 months", isPaid: true },
            { key: "6-months", label: "6 months", isPaid: true }
          ]
        });
        toast.success("Internship created.");
      }
      resetForm();
      load();
    } catch (e) {
      console.error(e);
      toast.error(editingId ? "Could not update internship." : "Could not create internship.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (internship) => {
    setEditingId(internship._id);
    setForm({
      title: internship.title || "",
      slug: internship.slug || "",
      shortDescription: internship.shortDescription || "",
      role: internship.role || "",
      mode: internship.mode || "remote"
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (internship) => {
    const shouldDelete = window.confirm(
      `Delete "${internship.title}" from live listings?\n\nExisting student applications, completed records, and certificates will remain preserved.`
    );

    if (!shouldDelete) return;

    setDeletingId(internship._id);
    try {
      const { data } = await api.delete(`/internships/admin/${internship._id}`);
      toast.success(data.message || "Internship deleted.");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete internship.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Internship management</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Create and manage live internships. Advanced duration mapping and PDFs can be
          configured later via the API.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Deleting an internship removes it from live listings only. Old student records and
          certificates remain preserved.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="navyan-card grid gap-4 p-5 md:grid-cols-4 text-xs"
      >
        <Field label="Title">
          <Input name="title" value={form.title} onChange={handleChange} />
        </Field>
        <Field label="Slug">
          <Input name="slug" value={form.slug} onChange={handleChange} />
        </Field>
        <Field label="Role">
          <Input name="role" value={form.role} onChange={handleChange} />
        </Field>
        <Field label="Mode">
          <Input name="mode" value={form.mode} onChange={handleChange} />
        </Field>
        <div className="md:col-span-3">
          <Field label="Short description">
            <Input
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
            />
          </Field>
        </div>
        <div className="md:col-span-1 flex items-end">
          <div className="flex w-full gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                  ? "Update internship"
                  : "Create internship"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Existing internships</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {internships.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No internships yet. Create your first role.</p>
          ) : (
            internships.map((i) => (
              <div
                key={i._id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{i.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {i.role} · {i.mode?.toUpperCase()} · Slug: {i.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                    {i.isPublished ? "Published" : "Draft"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(i)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={deletingId === i._id}
                    onClick={() => handleDelete(i)}
                  >
                    {deletingId === i._id ? "Deleting..." : "Delete"}
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
      <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">{label}</label>
      {children}
    </div>
  );
}
