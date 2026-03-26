const normalize = (value) => String(value || "").trim().toLowerCase();

export const buildJobFilterOptions = (jobs = []) => {
  const collect = (key) =>
    Array.from(
      new Set(
        jobs
          .map((job) => String(job?.[key] || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

  return {
    roles: collect("role"),
    fields: collect("field"),
    locations: collect("location"),
    employmentTypes: collect("employmentType")
  };
};

export const filterJobs = (jobs = [], filters = {}) => {
  const search = normalize(filters.search);
  const role = normalize(filters.role);
  const field = normalize(filters.field);
  const location = normalize(filters.location);
  const employmentType = normalize(filters.employmentType);

  return jobs.filter((job) => {
    const matchesSearch =
      !search ||
      [
        job.title,
        job.companyName,
        job.description,
        job.role,
        job.field,
        job.location,
        ...(job.tags || [])
      ]
        .filter(Boolean)
        .some((value) => normalize(value).includes(search));

    const matchesRole = !role || normalize(job.role) === role;
    const matchesField = !field || normalize(job.field) === field;
    const matchesLocation = !location || normalize(job.location) === location;
    const matchesEmploymentType =
      !employmentType || normalize(job.employmentType) === employmentType;

    return (
      matchesSearch &&
      matchesRole &&
      matchesField &&
      matchesLocation &&
      matchesEmploymentType
    );
  });
};
