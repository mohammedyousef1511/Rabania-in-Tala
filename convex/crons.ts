import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// تشغيل عملية إعادة التعيين كل يوم في الساعة 7 صباحاً
crons.cron("reset-daily-tasks", "0 7 * * *", internal.tasks.resetDailyTasks);

export default crons;
