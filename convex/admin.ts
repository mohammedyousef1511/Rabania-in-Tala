import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getReport = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = await ctx.db.get(userId!);
    if (user?.email !== "admin@example.com") {
      throw new Error("غير مصرح لك بعرض التقارير");
    }

    const completions = await ctx.db
      .query("completions")
      .withIndex("by_date", q => 
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    const users = await Promise.all(
      [...new Set(completions.map(c => c.userId))].map(id => 
        ctx.db.get(id)
      )
    );
    
    const tasks = await Promise.all(
      [...new Set(completions.map(c => c.taskId))].map(id =>
        ctx.db.get(id)
      )
    );

    return {
      completions,
      users: users.filter(u => u !== null),
      tasks: tasks.filter(t => t !== null),
    };
  },
});
