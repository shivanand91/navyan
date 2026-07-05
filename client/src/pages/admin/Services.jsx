import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const createEmptyForm = () => ({
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  highlights: ""
});

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [featureImageFile, setFeatureImageFile] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/services/admin");
      setServices(data.services || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setFeatureImageFile(null);
    setFeatureImagePreview("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("slug", form.slug);
    payload.append("shortDescription", form.shortDescription);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("highlights", form.highlights);

    if (featureImageFile) {
      payload.append("featureImage", featureImageFile);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/services/admin/${editingId}`, buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Service updated.");
      } else {
        await api.post("/services/admin", buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Service created.");
      }

      resetForm();
      load();
    } catch (error) {
      console.error(error);
      toast.error(editingId ? "Could not update service." : "Could not create service.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setForm({
      title: service.title || "",
      slug: service.slug || "",
      shortDescription: service.shortDescription || "",
      description: service.description || "",
      category: service.category || "",
      highlights: (service.highlights || []).join(", ")
    });
    setFeatureImageFile(null);
    setFeatureImagePreview(service.featureImageUrl || "");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (service) => {
    const shouldDelete = window.confirm(`Delete "${service.title}" from live service listings?`);
    if (!shouldDelete) return;

    setDeletingId(service._id);
    try {
      const { data } = await api.delete(`/services/admin/${service._id}`);
      toast.success(data.message || "Service deleted.");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete service.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFeatureImageFile(file);
    setFeatureImagePreview(file ? URL.createObjectURL(file) : "");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Service management</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Create trust-building service cards with feature images, highlights, and a direct lead flow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="navyan-card grid gap-4 p-5 md:grid-cols-4">
        <Field label="Title">
          <Input name="title" value={form.title} onChange={handleChange} />
        </Field>
        <Field label="Slug">
          <Input name="slug" value={form.slug} onChange={handleChange} />
        </Field>
        <Field label="Category">
          <Input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Web, Mobile, Design" />
        </Field>
        <Field label="Feature image">
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </Field>

        <div className="md:col-span-2">
          <Field label="Short description">
            <Input name="shortDescription" value={form.shortDescription} onChange={handleChange} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Highlights">
            <Input
              name="highlights"
              value={form.highlights}
              onChange={handleChange}
              placeholder="comma separated, e.g. MVP, admin panel, responsive UI"
            />
          </Field>
        </div>

        <div className="md:col-span-4">
          <Field label="Description">
            <Textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain the service clearly so the public card and detail section build trust."
            />
          </Field>
        </div>

        {(featureImagePreview || editingId) ? (
          <div className="md:col-span-3">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Image preview</p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-[#2a2a36] dark:bg-[#16161f]">
                {featureImagePreview ? (
                  <img
                    src={featureImagePreview}
                    alt="Service preview"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                    No feature image uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="md:col-span-1 flex items-end">
          <div className="flex w-full gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                  ? "Update service"
                  : "Create service"}
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
          <CardTitle className="text-sm">Existing services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {services.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No services yet. Create your first service offering.</p>
          ) : (
            services.map((service) => (
              <div
                key={service._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-[#2a2a36] dark:bg-[#16161f]">
                    {service.featureImageUrl ? (
                      <img
                        src={service.featureImageUrl}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-slate-500 dark:text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{service.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {service.category || "General"} · Slug: {service.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                    {service.isPublished ? "Published" : "Draft"}
                  </span>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(service)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={deletingId === service._id}
                    onClick={() => handleDelete(service)}
                  >
                    {deletingId === service._id ? "Deleting..." : "Delete"}
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
