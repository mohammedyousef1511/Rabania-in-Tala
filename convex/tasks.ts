import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// الدوال السابقة تبقى كما هي
export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").filter(q => q.eq(q.field("isActive"), true)).collect();
  },
});

export const addTask = mutation({
  args: {
    title: v.string(),
    score: v.number(),
    type: v.union(v.literal("checkbox"), v.literal("numeric")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = await ctx.db.get(userId!);
    if (user?.email !== "admin@example.com") {
      throw new Error("غير مصرح لك بإضافة مهام");
    }
    
    await ctx.db.insert("tasks", {
      ...args,
      isActive: true,
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = await ctx.db.get(userId!);
    if (user?.email !== "admin@example.com") {
      throw new Error("غير مصرح لك بحذف المهام");
    }
    
    await ctx.db.patch(args.taskId, { isActive: false });
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    completed: v.boolean(),
    numericValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");
    
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("المهمة غير موجودة");
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed today
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", q => 
        q.eq("userId", userId).eq("date", today)
      )
      .filter(q => q.eq(q.field("taskId"), args.taskId))
      .unique();
    
    const score = args.completed ? task.score : 0;
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        numericValue: args.numericValue,
        score,
      });
    } else {
      await ctx.db.insert("completions", {
        userId,
        taskId: args.taskId,
        date: today,
        completed: args.completed,
        numericValue: args.numericValue,
        score,
      });
    }
  },
});

export const getDailyCompletions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const today = new Date().toISOString().split('T')[0];
    return await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", q => 
        q.eq("userId", userId).eq("date", today)
      )
      .collect();
  },
});

export const getDailyScore = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const completions = await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", q => 
        q.eq("userId", userId).eq("date", today)
      )
      .collect();
    
    return completions.reduce((sum, c) => sum + c.score, 0);
  },
});

// دالة إعادة تعيين المهام اليومية - تُستدعى تلقائياً في الساعة 7 صباحاً
export const resetDailyTasks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // حذف إنجازات اليوم السابق
    const oldCompletions = await ctx.db
      .query("completions")
      .withIndex("by_date", q => q.eq("date", yesterday))
      .collect();
    
    for (const completion of oldCompletions) {
      await ctx.db.delete(completion._id);
    }
  },
});
