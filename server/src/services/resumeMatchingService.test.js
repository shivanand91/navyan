import test from "node:test";
import assert from "node:assert/strict";
import { normalizeResume, rankInternshipPresets } from "./resumeMatchingService.js";

test("normalizes aliases and recommends skill matches without requiring projects", () => {
  const resume = normalizeResume("Rahul Verma\nTECHNICAL SKILLS\nReactJS, JavaScript, Node.js, ExpressJS, Mongo DB");
  assert.equal(resume.studentName, "Rahul Verma");
  assert.ok(resume.detectedSkills.includes("react"));
  assert.ok(resume.detectedSkills.includes("mongodb"));
  assert.equal(resume.detectedProjects.length, 0);
  const fullstack = rankInternshipPresets(resume).find((item) => item.preset.presetId === "FULLSTACK_DEVELOPMENT");
  assert.ok(fullstack.matchedSkills.length >= 4);
  assert.equal(fullstack.matchedProjects.length, 0);
});

test("matches cybersecurity evidence and deduplicates repeated skills", () => {
  const resume = normalizeResume("SKILLS\nPython, Linux, Networking\nPython\nPROJECTS\nSecurity log analysis dashboard using sample logs");
  assert.equal(resume.detectedSkills.filter((skill) => skill === "python").length, 1);
  const cyber = rankInternshipPresets(resume).find((item) => item.preset.presetId === "CYBER_AI");
  assert.ok(cyber.score > 0);
  assert.ok(cyber.matchedProjects.includes("security log analysis"));
});

test("does not infer skills from unrelated text", () => {
  const resume = normalizeResume("SUMMARY\nI am looking for opportunities and enjoy learning new things.");
  assert.deepEqual(resume.detectedSkills, []);
});

test("does not treat a job title as a student name and normalizes name punctuation", () => {
  assert.equal(normalizeResume("Software Engineer\nSUMMARY\nExperienced in software delivery.").studentName, null);
  assert.equal(normalizeResume("Rahul Kumar.\nrahul@example.com").studentName, "Rahul Kumar");
});
