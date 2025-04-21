import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function UserDashboard() {
  const tasks = useQuery(api.tasks.listTasks) || [];
  const completions = useQuery(api.tasks.getDailyCompletions) || [];
  const dailyScore = useQuery(api.tasks.getDailyScore) || 0;
  const completeTask = useMutation(api.tasks.completeTask);

  const handleTaskChange = async (
    taskId: Id<"tasks">,
    completed: boolean,
    numericValue?: number
  ) => {
    try {
      await completeTask({ taskId, completed, numericValue });
      toast.success("تم حفظ تقدمك");
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ تقدمك");
    }
  };

  const getTaskCompletion = (taskId: Id<"tasks">) => {
    return completions.find(c => c.taskId === taskId);
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-100 p-6 rounded-lg">
        <h3 className="text-2xl font-semibold mb-2">نقاط اليوم</h3>
        <p className="text-4xl font-bold text-indigo-600">{dailyScore}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4">مهام اليوم</h3>
        <div className="space-y-4">
          {tasks.map(task => {
            const completion = getTaskCompletion(task._id);
            
            return (
              <div key={task._id} className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{task.title}</h4>
                  <span className="text-sm text-gray-600">النقاط: {task.score}</span>
                </div>
                
                {task.type === "checkbox" ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={completion?.completed ?? false}
                      onChange={e => handleTaskChange(task._id, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>تم الإنجاز</span>
                  </label>
                ) : (
                  <div>
                    <input
                      type="number"
                      value={completion?.numericValue ?? ""}
                      onChange={e => {
                        const value = Number(e.target.value);
                        handleTaskChange(task._id, value > 0, value);
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="أدخل القيمة"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
