import { describe, it, expect } from "vitest";
import { createTask, toggleTask, filterTasks, getVisibleTasks } from "@/lib/tasks";

describe("createTask", () => {
  it("creates a task with correct shape", () => {
    const task = createTask("Buy milk");
    expect(task.title).toBe("Buy milk");
    expect(task.completed).toBe(false);
    expect(task.completedAt).toBeNull();
    expect(task.priority).toBe("med");
    expect(typeof task.id).toBe("string");
  });
});

describe("toggleTask", () => {
  it("marks an open task as completed", () => {
    const task = createTask("Do thing");
    const toggled = toggleTask(task);
    expect(toggled.completed).toBe(true);
    expect(toggled.completedAt).not.toBeNull();
  });

  it("marks a completed task as open", () => {
    const task = toggleTask(createTask("Do thing"));
    const reopened = toggleTask(task);
    expect(reopened.completed).toBe(false);
    expect(reopened.completedAt).toBeNull();
  });
});

describe("filterTasks", () => {
  const open = createTask("Open task");
  const done = toggleTask(createTask("Done task"));

  it("returns all tasks for filter 'all'", () => {
    expect(filterTasks([open, done], "all")).toHaveLength(2);
  });

  it("returns only open tasks for filter 'open'", () => {
    const result = filterTasks([open, done], "open");
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(false);
  });

  it("returns only completed tasks for filter 'done'", () => {
    const result = filterTasks([open, done], "done");
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });
});

describe("getVisibleTasks", () => {
  it("returns filtered tasks sorted newest first", () => {
    const a = createTask("First");
    const b = createTask("Second");
    const result = getVisibleTasks([a, b], "open");
    expect(result.length).toBe(2);
  });
});
