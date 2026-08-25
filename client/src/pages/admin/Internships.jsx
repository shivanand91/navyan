import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Trash2, Plus, AlertCircle } from "lucide-react";

const createEmptyForm = () => ({
  title: "",
  slug: "",
  shortDescription: "",
  role: "",
  mode: "remote",
  durations: [
    {
      key: "4-weeks",
      label: "4 weeks",
      isPaid: true,
      price: 49,
      benefits: ["Workspace Access", "Basic Tasks", "Verifiable Certificate"],
      rewards: ["Performance Recognition"],
      description: "Introductory cohort",
      mentorship: "Weekly group Q&A",
      schedule: "Recorded guidance",
      projects: ["1 Micro-project"],
      tasks: ["Weekly submissions"],
      certificate: "Digital Certificate",
      swag: "Digital Certificate only",
      eligibility: "Open to all students",
      faqs: []
    },
    {
      key: "3-months",
      label: "3 months",
      isPaid: true,
      price: 2499,
      benefits: ["Workspace Access", "Live Classes", "Stipend Reward", "Navyan Swag Box"],
      rewards: ["Top 3 Performers: ₹5,000"],
      description: "Deep-dive development track",
      mentorship: "1-on-1 Project reviews",
      schedule: "Weekend Live Classes",
      projects: ["2 Full-stack projects"],
      tasks: ["Advanced task sets"],
      certificate: "Premium Certificate",
      swag: "Navyan Swag Box (T-shirt, Sticker)",
      eligibility: "Basic coding knowledge",
      faqs: []
    },
    {
      key: "6-months",
      label: "6 months",
      isPaid: true,
      price: 4499,
      benefits: ["Workspace Access", "Live Classes", "Dedicated Mentor", "Elite Swag Hoodie Box"],
      rewards: ["Top Performer: ₹8,000"],
      description: "Production grade internship track",
      mentorship: "Dedicated Slack Coach & reviews",
      schedule: "Weekend Live Classes & Roadmaps",
      projects: ["1 Production Capstone"],
      tasks: ["Enterprise architecture tasks"],
      certificate: "Elite Certificate",
      swag: "Navyan Elite Swag (Hoodie, T-Shirt, Swag Kit)",
      eligibility: "Intermediate programming skills",
      faqs: []
    }
  ]
});

export default function AdminInternships() {
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

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

  const handleDurationChange = (index, field, value) => {
    setForm((f) => {
      const copy = [...f.durations];
      copy[index] = { ...copy[index], [field]: value };
      return { ...f, durations: copy };
    });
  };

  const handleDurationArrayChange = (index, field, textValue) => {
    const arr = textValue.split("\n").map(s => s.trim()).filter(Boolean);
    handleDurationChange(index, field, arr);
  };

  const handleAddDuration = () => {
    setForm((f) => ({
      ...f,
      durations: [
        ...f.durations,
        {
          key: "custom-duration",
          label: "Custom duration",
          isPaid: false,
          price: 0,
          benefits: [],
          rewards: [],
          description: "",
          mentorship: "",
          schedule: "",
          projects: [],
          tasks: [],
          certificate: "",
          swag: "",
          eligibility: "",
          faqs: []
        }
      ]
    }));
  };

  const handleRemoveDuration = (index) => {
    setForm((f) => {
      const copy = f.durations.filter((_, i) => i !== index);
      return { ...f, durations: copy };
    });
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setCoverImageFile(null);
    setCoverImagePreview("");
  };

  const buildPayload = () => {
    const payload = new FormData();

    payload.append("title", form.title);
    payload.append("slug", form.slug);
    payload.append("shortDescription", form.shortDescription);
    payload.append("role", form.role);
    payload.append("mode", form.mode);
    payload.append("durations", JSON.stringify(form.durations));

    if (coverImageFile) {
      payload.append("coverImage", coverImageFile);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/internships/admin/${editingId}`, buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Internship updated.");
      } else {
        const payload = buildPayload();
        payload.append("isPublished", "true");

        await api.post("/internships/admin", payload, {
          headers: { "Content-Type": "multipart/form-data" }
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
      mode: internship.mode || "remote",
      durations: internship.durations || []
    });
    setCoverImageFile(null);
    setCoverImagePreview(internship.coverImageUrl || "");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCoverImageFile(file);
    setCoverImagePreview(file ? URL.createObjectURL(file) : "");
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
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Internship Management Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Create, update, and manage live internships. Configure custom dynamic pricing plans, duration cohorts, benefits, and FAQ details instantly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="navyan-card p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#2a2a36] rounded-2xl space-y-6"
      >
        <div className="grid gap-4 text-xs md:grid-cols-4">
          <Field label="Title">
            <Input name="title" value={form.title} onChange={handleChange} required />
          </Field>
          <Field label="Slug">
            <Input name="slug" value={form.slug} onChange={handleChange} required />
          </Field>
          <Field label="Role">
            <Input name="role" value={form.role} onChange={handleChange} required />
          </Field>
          <Field label="Mode">
            <Input name="mode" value={form.mode} onChange={handleChange} required />
          </Field>
          <div className="md:col-span-3">
            <Field label="Short description">
              <Input
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                required
              />
            </Field>
          </div>
          <div className="md:col-span-1">
            <Field label="Feature image">
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </Field>
          </div>
        </div>

        {coverImagePreview && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Image preview
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-[#2a2a36] dark:bg-[#16161f] max-w-md">
              <img
                src={coverImagePreview}
                alt="Internship cover preview"
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Dynamic Duration Plans Accordion Editor */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Duration Cohorts & Plans Editor
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Add one or more cohort plans. Pricing and details will propagate automatically to detail views.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDuration}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Duration Plan
            </Button>
          </div>

          <div className="space-y-4">
            {form.durations.map((duration, index) => {
              const faqs = duration.faqs || [];
              return (
                <div
                  key={index}
                  className="p-5 border border-slate-200 dark:border-[#2a2a36] bg-white dark:bg-[#141b2b] rounded-xl space-y-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveDuration(index)}
                    className="absolute right-4 top-4 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                    title="Remove Duration Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Plan #{index + 1}: {duration.label || duration.key || "Unnamed"}
                  </h4>

                  <div className="grid gap-4 text-xs md:grid-cols-4">
                    <Field label="Key (e.g. 4-weeks)">
                      <Input
                        value={duration.key || ""}
                        onChange={(e) => handleDurationChange(index, "key", e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Label (e.g. 4 Weeks)">
                      <Input
                        value={duration.label || ""}
                        onChange={(e) => handleDurationChange(index, "label", e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Track Pricing Model">
                      <select
                        value={duration.isPaid ? "paid" : "free"}
                        onChange={(e) => handleDurationChange(index, "isPaid", e.target.value === "paid")}
                        className="w-full h-9 rounded-md border border-input bg-[#ffffff] dark:bg-slate-900 px-3 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="paid">Paid (Stipend/Premium)</option>
                        <option value="free">Free Track</option>
                      </select>
                    </Field>
                    <Field label="Price / Fee (INR)">
                      <Input
                        type="number"
                        value={duration.price || 0}
                        onChange={(e) => handleDurationChange(index, "price", Number(e.target.value))}
                        disabled={!duration.isPaid}
                        required
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Short Description / Subtitle">
                        <Input
                          value={duration.description || ""}
                          onChange={(e) => handleDurationChange(index, "description", e.target.value)}
                        />
                      </Field>
                    </div>
                    <Field label="Mentorship Level">
                      <Input
                        value={duration.mentorship || ""}
                        onChange={(e) => handleDurationChange(index, "mentorship", e.target.value)}
                        placeholder="e.g. 1-on-1 Reviews"
                      />
                    </Field>
                    <Field label="Schedule / Classes">
                      <Input
                        value={duration.schedule || ""}
                        onChange={(e) => handleDurationChange(index, "schedule", e.target.value)}
                        placeholder="e.g. Weekend Live Classes"
                      />
                    </Field>

                    <Field label="Certificate Level">
                      <Input
                        value={duration.certificate || ""}
                        onChange={(e) => handleDurationChange(index, "certificate", e.target.value)}
                        placeholder="e.g. Verified Premium"
                      />
                    </Field>
                    <Field label="Swag Kit Included">
                      <Input
                        value={duration.swag || ""}
                        onChange={(e) => handleDurationChange(index, "swag", e.target.value)}
                        placeholder="e.g. T-shirt & Stickers"
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Eligibility Criteria">
                        <Input
                          value={duration.eligibility || ""}
                          onChange={(e) => handleDurationChange(index, "eligibility", e.target.value)}
                          placeholder="e.g. Open to all students"
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Benefits List (One benefit per line)">
                        <textarea
                          value={(duration.benefits || []).join("\n")}
                          onChange={(e) => handleDurationArrayChange(index, "benefits", e.target.value)}
                          className="w-full min-h-[80px] rounded-md border border-input bg-[#ffffff] dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                          placeholder="Workspace Access&#10;Mentorship Support&#10;Certificate Verification"
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Rewards List (One reward per line)">
                        <textarea
                          value={(duration.rewards || []).join("\n")}
                          onChange={(e) => handleDurationArrayChange(index, "rewards", e.target.value)}
                          className="w-full min-h-[80px] rounded-md border border-input bg-[#ffffff] dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                          placeholder="Top Performer: ₹5,000&#10;Direct Stipend referrals"
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Projects Roadmap (One project per line)">
                        <textarea
                          value={(duration.projects || []).join("\n")}
                          onChange={(e) => handleDurationArrayChange(index, "projects", e.target.value)}
                          className="w-full min-h-[80px] rounded-md border border-input bg-[#ffffff] dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                          placeholder="1 Portfolio project&#10;2 Production capstones"
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Tasks Brief (One task type per line)">
                        <textarea
                          value={(duration.tasks || []).join("\n")}
                          onChange={(e) => handleDurationArrayChange(index, "tasks", e.target.value)}
                          className="w-full min-h-[80px] rounded-md border border-input bg-[#ffffff] dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                          placeholder="Weekly coding submissions&#10;Final milestone evaluation"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* FAQ Nested Form inside Durations */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Cohort Plan FAQs
                      </span>
                    </div>

                    {faqs.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No plan FAQs added. Click button to add.</p>
                    ) : (
                      <div className="space-y-2">
                        {faqs.map((faq, faqIdx) => (
                          <div key={faqIdx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                              <Input
                                placeholder="Question"
                                value={faq.question || ""}
                                onChange={(e) => {
                                  const newFaqs = [...faqs];
                                  newFaqs[faqIdx] = { ...newFaqs[faqIdx], question: e.target.value };
                                  handleDurationChange(index, "faqs", newFaqs);
                                }}
                              />
                            </div>
                            <div className="col-span-6">
                              <Input
                                placeholder="Answer"
                                value={faq.answer || ""}
                                onChange={(e) => {
                                  const newFaqs = [...faqs];
                                  newFaqs[faqIdx] = { ...newFaqs[faqIdx], answer: e.target.value };
                                  handleDurationChange(index, "faqs", newFaqs);
                                }}
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newFaqs = faqs.filter((_, i) => i !== faqIdx);
                                  handleDurationChange(index, "faqs", newFaqs);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFaqs = [...faqs, { question: "", answer: "" }];
                        handleDurationChange(index, "faqs", newFaqs);
                      }}
                      className="text-[10px] h-7 px-2.5 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add FAQ Item
                    </Button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Action Form buttons */}
        <div className="flex gap-2 justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving} className="px-6">
            {saving
              ? editingId
                ? "Updating..."
                : "Creating..."
              : editingId
                ? "Update Internship"
                : "Publish Internship"}
          </Button>
        </div>
      </form>

      {/* List Existing internships */}
      <Card className="rounded-2xl border border-slate-200 dark:border-[#2a2a36]">
        <CardHeader className="border-b border-slate-100 dark:border-[#2a2a36] bg-slate-50/50 dark:bg-slate-900/50 py-4">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Live listings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          {internships.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic">No internships published yet. Create one above.</p>
          ) : (
            internships.map((i) => (
              <div
                key={i._id}
                className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between hover:bg-slate-100/50 dark:hover:bg-[#1d1d29] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-[#2a2a36] dark:bg-[#16161f]">
                    {i.coverImageUrl ? (
                      <img
                        src={i.coverImageUrl}
                        alt={i.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-slate-500 dark:text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{i.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Role: <span className="font-semibold text-slate-700 dark:text-slate-300">{i.role}</span> · Mode: <span className="font-semibold text-slate-700 dark:text-slate-300">{i.mode?.toUpperCase()}</span> · Slug: <span className="font-mono text-slate-500">{i.slug}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(i.durations || []).map((d) => (
                        <span key={d.key} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                          {d.label || d.key} (₹{d.price})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
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
    <div className="space-y-1 w-full">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
        {label}
      </label>
      {children}
    </div>
  );
}
