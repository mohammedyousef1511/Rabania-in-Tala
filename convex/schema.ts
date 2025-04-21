import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  tasks: defineTable({
    title: v.string(),
    score: v.number(),
    type: v.union(v.literal("checkbox"), v.literal("numeric")),
    isActive: v.boolean(),
  }),
  
  completions: defineTable({
    userId: v.id("users"),
    taskId: v.id("tasks"),
    date: v.string(),
    completed: v.boolean(),
    numericValue: v.optional(v.number()),
    score: v.number(),
  })
    .index("by_user_and_date", ["userId", "date"])
    .index("by_date", ["date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
